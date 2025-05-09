// This file contains constants used throughout the application

// GitHub repository URL for adding new pools
export const GITHUB_ISSUE_URL = 'https://github.com/sbddesign/hash-league/issues/new?template=add-pool.md';

// Map configuration constants
export const MAP_CONFIG = {
  initialView: [20, 0] as [number, number],
  defaultZoom: 2,
  minZoom: 2,
  maxZoom: 10,
  tileLayerUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Theme colors
export const COLORS = {
  background: '#000000',
  neonBlue: '#00f3ff',
  neonPink: '#ff00ea',
  neonGreen: '#39FF14',
  text: '#ffffff'
};

// Days of the week for hashrate history
export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
