// This file contains custom types used throughout the application

// Leaflet is added at runtime via CDN, so we need to declare it for TypeScript
declare global {
  interface Window {
    L: any;
  }
}

export {};
