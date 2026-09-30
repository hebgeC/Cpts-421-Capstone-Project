import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'trm.savedResources.v1';

export const SavedResourcesContext = createContext({
  savedResources: [],
  isSaved: () => false,
  toggleSaved: () => {},
  removeSaved: () => {},
});

export function getSavedResourceKey(resource) {
  if (resource.savedKey) return resource.savedKey;
  if (resource.resourceType === 'page' || resource.slug) return `page:${resource.slug}`;
  if (resource.resourceType === 'external') return `external:${resource.key || resource.url}`;
  return `article:${resource.kind || 'articles'}:${resource.id}`;
}

function toStoredResource(resource) {
  return {
    savedKey: getSavedResourceKey(resource),
    resourceType: resource.resourceType || 'article',
    id: resource.id,
    kind: resource.kind,
    key: resource.key,
    slug: resource.slug,
    url: resource.url,
    title: resource.title || 'Untitled',
    date: resource.date,
    image: resource.image,
    author: resource.author,
    excerpt: resource.excerpt,
    link: resource.link,
    icon: resource.icon,
    categoryTitle: resource.categoryTitle,
  };
}

async function readSavedResources() {
  const value = Platform.OS === 'web'
    ? globalThis.localStorage?.getItem(STORAGE_KEY)
    : await SecureStore.getItemAsync(STORAGE_KEY);
  return value ? JSON.parse(value) : [];
}

async function writeSavedResources(resources) {
  const value = JSON.stringify(resources);
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(STORAGE_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, value);
}

export function SavedResourcesProvider({ children }) {
  const [savedResources, setSavedResources] = useState([]);

  useEffect(() => {
    let mounted = true;
    readSavedResources()
      .then((resources) => {
        if (mounted && Array.isArray(resources)) setSavedResources(resources);
      })
      .catch(() => {
        // A storage failure should not prevent the rest of the app from loading.
      });
    return () => { mounted = false; };
  }, []);

  const updateSavedResources = useCallback((updater) => {
    setSavedResources((current) => {
      const next = updater(current);
      writeSavedResources(next).catch(() => {});
      return next;
    });
  }, []);

  const isSaved = useCallback((resource) => {
    const key = getSavedResourceKey(resource);
    return savedResources.some((item) => item.savedKey === key);
  }, [savedResources]);

  const toggleSaved = useCallback((resource) => {
    const storedResource = toStoredResource(resource);
    updateSavedResources((current) => {
      const exists = current.some((item) => item.savedKey === storedResource.savedKey);
      return exists
        ? current.filter((item) => item.savedKey !== storedResource.savedKey)
        : [storedResource, ...current];
    });
  }, [updateSavedResources]);

  const removeSaved = useCallback((resource) => {
    const key = typeof resource === 'string' ? resource : getSavedResourceKey(resource);
    updateSavedResources((current) => current.filter((item) => item.savedKey !== key));
  }, [updateSavedResources]);

  const value = useMemo(() => ({
    savedResources,
    isSaved,
    toggleSaved,
    removeSaved,
  }), [savedResources, isSaved, toggleSaved, removeSaved]);

  return (
    <SavedResourcesContext.Provider value={value}>
      {children}
    </SavedResourcesContext.Provider>
  );
}
