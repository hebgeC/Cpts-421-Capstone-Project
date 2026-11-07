<?php
/**
 * Plugin Name: TRM App Authentication
 * Description: REST endpoint used by the Tacoma Rescue Mission mobile app's backend to verify trm.org account credentials. Not for direct use by the app or by end users - only the app's backend server may call it, authenticated with an administrator Application Password.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('trm/v1', '/authenticate', [
        'methods'             => 'POST',
        'callback'            => 'trm_app_authenticate',
        'permission_callback' => 'trm_app_authenticate_permission',
    ]);
});

/**
 * Only the app's backend service account may call this endpoint. It must
 * authenticate the request itself with an administrator Application Password
 * (HTTP Basic Auth), which WordPress core resolves into wp_get_current_user()
 * before this callback runs.
 */
function trm_app_authenticate_permission($request) {
    $user = wp_get_current_user();
    if (!$user || !$user->exists() || !user_can($user, 'manage_options')) {
        return new WP_Error('rest_forbidden', 'Not authorized.', ['status' => 401]);
    }
    return true;
}

function trm_app_authenticate(WP_REST_Request $request) {
    $username = (string) $request->get_param('username');
    $password = (string) $request->get_param('password');

    if ($username === '' || $password === '') {
        return new WP_Error('missing_credentials', 'Username and password are required.', ['status' => 400]);
    }

    // Basic throttling so this can't be used as a password-guessing oracle.
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $attempts_key = 'trm_login_attempts_' . md5(strtolower($username) . '|' . $ip);
    $attempts = (int) get_transient($attempts_key);

    if ($attempts >= 10) {
        return new WP_Error('too_many_attempts', 'Too many login attempts. Please try again later.', ['status' => 429]);
    }

    $user = wp_authenticate($username, $password);

    if (is_wp_error($user)) {
        set_transient($attempts_key, $attempts + 1, 15 * MINUTE_IN_SECONDS);
        return new WP_Error('invalid_credentials', 'Invalid username or password.', ['status' => 401]);
    }

    delete_transient($attempts_key);

    return [
        'id'           => $user->ID,
        'username'     => $user->user_login,
        'display_name' => $user->display_name,
        'email'        => $user->user_email,
        'avatar_url'   => get_avatar_url($user->ID),
        'roles'        => array_values($user->roles),
    ];
}
