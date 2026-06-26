const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src', 'components', 'Dashboard.jsx');
let content = fs.readFileSync(dashboardPath, 'utf8');

const lines = content.split('\n');

const correctImports = \`import React, { useState, useEffect, useMemo, Component } from 'react';
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
import { COLORS, DOC_COLORS, AGE_RANGES } from '../config/constants';\`;

// Skip the first 50 lines (the duplicate block) and append the rest
let restOfLines = lines.slice(50);
fs.writeFileSync(dashboardPath, correctImports + '\\n' + restOfLines.join('\\n'), 'utf8');
console.log('Fixed imports cleanly');
