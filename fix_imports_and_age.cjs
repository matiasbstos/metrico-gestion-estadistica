const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src', 'components', 'Dashboard.jsx');
let content = fs.readFileSync(dashboardPath, 'utf8');

const lines = content.split('\n');
const seenImports = new Set();
const newLines = [];
let insideLucide = false;
let insideRecharts = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Remove AGE_RANGES declaration
  if (line.includes("const AGE_RANGES = ['0-4'")) {
    continue;
  }
  
  // Handle multiline imports naively by checking if they are the same block
  if (line.startsWith('import {') && line.includes('lucide-react')) {
     if (seenImports.has('lucide-react')) continue;
     seenImports.add('lucide-react');
  } else if (line.startsWith('import {') && line.includes('recharts')) {
     if (seenImports.has('recharts')) continue;
     seenImports.add('recharts');
  } else if (line.trim() === 'import {' && lines[i+7] && lines[i+7].includes('lucide-react')) {
     if (seenImports.has('lucide-react')) { i+=7; continue; }
     seenImports.add('lucide-react');
  } else if (line.trim() === 'import {' && lines[i+3] && lines[i+3].includes('recharts')) {
     if (seenImports.has('recharts')) { i+=3; continue; }
     seenImports.add('recharts');
  }

  // Handle single line imports
  if (line.startsWith('import ')) {
    if (seenImports.has(line.trim())) {
      continue;
    }
    seenImports.add(line.trim());
  }
  
  newLines.push(line);
}

const finalStr = newLines.join('\n');
const insertPos = finalStr.lastIndexOf('import ');
const beforeInsert = finalStr.substring(0, insertPos);
let afterInsert = finalStr.substring(insertPos);

// Wait, a better way is to just rebuild imports from scratch based on a clean list.
const cleanImports = \`import React, { useState, useEffect, useMemo, Component } from 'react';
import PanelKPIs from './dashboard/PanelKPIs';
import FiltrosGlobales from './dashboard/FiltrosGlobales';
import GraficoDinamico from './dashboard/GraficoDinamico';
import CurvaDemanda from './dashboard/CurvaDemanda';
import AnalisisSociodemografico from './dashboard/AnalisisSociodemografico';
import TablaTiemposEspera from './dashboard/TablaTiemposEspera';
import AnalisisProfesionales from './dashboard/AnalisisProfesionales';
import DataGridTurnos from './dashboard/DataGridTurnos';
import { 
  Clock, Users, UserCheck, AlertTriangle, Activity, ArrowRight, 
  FileSpreadsheet, Database, BarChart2, Trash2, Edit, Edit2,
  CheckCircle, XCircle, Filter, PieChart as PieChartIcon, 
  BarChart as BarChartIcon, TrendingUp, X, Cloud, CloudUpload, CloudOff,
  Calendar, Layers, Save, TrendingDown, ArrowUpRight, ArrowDownRight,
  HeartPulse, Shield, Globe, Building2, MapPin, Search, Zap, UserPlus, Eraser
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, 
  LineChart, Line, ResponsiveContainer, CartesianGrid, ComposedChart, Area, AreaChart
} from 'recharts';

import { auth, db, appId } from '../config/firebase';
import { collection, doc, writeBatch, updateDoc, deleteDoc } from 'firebase/firestore';
import { useMetricoData } from '../hooks/useMetricoData';
import { useMetricoAnalytics } from '../hooks/useMetricoAnalytics';
import { useMetricoDemanda } from '../hooks/useMetricoDemanda';
import { useMetricoProfesionales } from '../hooks/useMetricoProfesionales';
import { COLORS, DOC_COLORS, AGE_RANGES } from '../config/constants';
\`;

// Extract everything after the last import
let restOfFile = finalStr.replace(/import[\s\S]*?(?=\n\n|\n\/\/ Colores|\nconst)/, '');
// Strip any remaining imports just in case
restOfFile = restOfFile.replace(/^import .*\n/gm, '');

fs.writeFileSync(dashboardPath, cleanImports + '\\n' + restOfFile, 'utf8');
console.log('Fixed imports deterministically');
