// NetInfo's isInternetReachable has been reporting false on-device across
// multiple known-good networks (confirmed reachable via successful Metro/API
// connections on the same device), so it's unreliable here as a fetch gate.
// Always report connected; let actual fetch calls fail on their own if the
// network really is down.
export default function useIsConnected() {
  return true;
}
