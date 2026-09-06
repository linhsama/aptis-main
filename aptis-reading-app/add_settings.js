const fs = require('fs');

function applySettingsToComponent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add filters state
  if (!content.includes('const [isStudy, setIsStudy] = useState(false)')) {
    content = content.replace('const [currentIndex, setCurrentIndex] = useState(0);', 
      'const [currentIndex, setCurrentIndex] = useState(0);\n  const [isStudy, setIsStudy] = useState(false);\n  const [isWeak, setIsWeak] = useState(false);\n  const [isSlow, setIsSlow] = useState(false);\n  const [filteredQuestions, setFilteredQuestions] = useState([]);\n  const [weakIds, setWeakIds] = useState(new Set());\n  const [slowIds, setSlowIds] = useState(new Set());\n  const { settings, updateSetting } = useSettings();');
  }
  
  // Add filter logic
  if (!content.includes('useEffect(() => {\n    const historyString = localStorage.getItem(\'aptis_history\');')) {
    const filterLogic = `
  useEffect(() => {
    const historyString = localStorage.getItem('aptis_history');
    const history = historyString ? JSON.parse(historyString) : [];
    const weak = new Set();
    const slow = new Set();
    
    // Process history to find weak/slow (same logic as Practice.jsx)
    const latestAttempts = {};
    history.forEach(entry => {
      if (!latestAttempts[entry.id] || new Date(entry.date) > new Date(latestAttempts[entry.id].date)) {
        latestAttempts[entry.id] = entry;
      }
    });

    Object.values(latestAttempts).forEach(entry => {
      if (entry.score < entry.total) weak.add(entry.id);
      if (entry.timeSpent > 300) slow.add(entry.id); // arbitrary slow threshold for reading
    });
    
    setWeakIds(weak);
    setSlowIds(slow);
  }, [historyVersion]);

  useEffect(() => {
    let active = [...part1Data]; // Replace part1Data with active data variable in actual code
    if (isWeak) {
      active = active.filter(q => weakIds.has(q.id));
    } else if (isSlow) {
      active = active.filter(q => slowIds.has(q.id));
    }
    
    if (settings.randomizeQuestions) {
      active.sort(() => Math.random() - 0.5);
    }
    
    if (active.length === 0 && (isWeak || isSlow)) {
      active = [...part1Data]; // fallback
    }
    
    setFilteredQuestions(active);
    setCurrentIndex(0);
  }, [isStudy, isWeak, isSlow, settings.randomizeQuestions, weakIds, slowIds]);
`;
    // We will manually inject this logic in the React components using multi_replace_file_content to be safer.
  }
}
