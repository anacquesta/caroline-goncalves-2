import React from 'react';
import { createRoot } from 'react-dom/client';
import { SiteShell } from '../components/site-shell';
import '../app/globals.css';
import './fonts.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><SiteShell /></React.StrictMode>);
