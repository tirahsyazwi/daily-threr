import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Trash2, History, X, Sparkles, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface Theme {
  id: string;
  name: string;
  colors: [string, string, string];
}

const THEMES: Theme[] = [
  { id: 'pastel', name: 'Original', colors: ['#FFB7B2', '#FFDAC1', '#C7CEEA'] },
  { id: 'theme1', name: 'Golden Earth', colors: ['#E7BD7F', '#692112', '#BB3932'] },
  { id: 'theme2', name: 'Sunset Crimson', colors: ['#C70025', '#FDAC8F', '#3A1012'] },
  { id: 'theme3', name: 'Garden Party', colors: ['#187106', '#FEE647', '#DA073C'] },
  { id: 'theme4', name: 'Sky & Sun', colors: ['#D3EAF8', '#097512', '#FDCD0F'] },
  { id: 'theme5', name: 'Sunset Purple', colors: ['#F89741', '#cc5158', '#655177'] },
  { id: 'theme6', name: 'Forest Red', colors: ['#C80019', '#e3eae0', '#499a72'] },
  { id: 'theme7', name: 'Lavender Cream', colors: ['#6d65d3', '#cca3e7', '#fcfaec'] },
  { id: 'theme8', name: 'Sky Candy', colors: ['#9bd8ec', '#ff8787', '#fff762'] },
  { id: 'theme9', name: 'Cherry Cream', colors: ['#Ffffc0', '#ff4065', '#b90620'] },
  { id: 'theme10', name: 'Earth Fire', colors: ['#Ea4d19', '#17392e', '#ebff87'] },
  { id: 'theme11', name: 'Olive Sky', colors: ['#889e29', '#ffeda6', '#89aeba'] },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pastTasks, setPastTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Load from local storage
  useEffect(() => {
    const savedTasks = localStorage.getItem('daily3_tasks');
    const savedPast = localStorage.getItem('daily3_past');
    const savedThemeId = localStorage.getItem('daily3_theme');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedPast) {
      const parsedPast = JSON.parse(savedPast);
      setPastTasks(Array.isArray(parsedPast) ? parsedPast.slice(0, 50) : []);
    }
    if (savedThemeId) {
      const theme = THEMES.find(t => t.id === savedThemeId);
      if (theme) setCurrentTheme(theme);
    }

    // Hide splash screen after a delay
    const timer = setTimeout(() => setIsFirstLoad(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('daily3_tasks', JSON.stringify(tasks));
    localStorage.setItem('daily3_past', JSON.stringify(pastTasks));
    localStorage.setItem('daily3_theme', currentTheme.id);
  }, [tasks, pastTasks, currentTheme]);

  // Apply theme colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', currentTheme.colors[0]);
    root.style.setProperty('--theme-secondary', currentTheme.colors[1]);
    root.style.setProperty('--theme-accent', currentTheme.colors[2]);
  }, [currentTheme]);

  const activeTasks = tasks.filter(t => !t.completed);
  const canAddTask = activeTasks.length < 3;

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !canAddTask) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const triggerConfetti = () => {
    const scalar = 5; // Increased scalar for the text shape
    const three = confetti.shapeFromText({ text: '3', scalar });

    confetti({
      shapes: [three, three, 'circle'], // More '3's, fewer standard shapes
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: currentTheme.colors,
      ticks: 300,
      gravity: 1,
      scalar: 1.2, // Increased overall particle size
      drift: 0,
    });
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (!task.completed) {
      // Completing a task: move to past log
      setTasks(tasks.filter(t => t.id !== id));
      setPastTasks([{ ...task, completed: true }, ...pastTasks].slice(0, 50)); // Keep last 50
      triggerConfetti();
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen max-w-md mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Splash Screen */}
      <AnimatePresence>
        {isFirstLoad && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="flex flex-col items-center"
            >
              <div 
                className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-slate-200"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <Sparkles size={40} className="text-white" />
              </div>
              <h2 className="text-6xl text-slate-900 font-hello -rotate-3">
                welcome
              </h2>
              <p className="text-slate-400 font-apple mt-4 font-medium tracking-wide uppercase text-[10px]">
                Daily Three
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Daily <span className="italic font-serif" style={{ color: 'var(--theme-primary)' }}>Three</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Focus on what matters today.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowThemes(true)}
            className="p-2 rounded-full bg-slate-100 text-slate-600 bouncy-hover"
          >
            <Palette size={20} />
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-full bg-slate-100 text-slate-600 bouncy-hover"
          >
            <History size={20} />
          </button>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className="h-2 flex-1 rounded-full transition-colors duration-500"
            style={{ 
              backgroundColor: i < activeTasks.length ? currentTheme.colors[i] : '#e2e8f0' 
            }}
          />
        ))}
      </div>

      {/* Task List */}
      <main className="flex-1 flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {activeTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 text-center flex flex-col items-center gap-3"
            >
              <div 
                className="w-16 h-16 rounded-3xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-secondary)', opacity: 0.2 }}
              >
                <Sparkles size={32} style={{ color: 'var(--theme-primary)' }} />
              </div>
              <p className="text-slate-400 font-medium">Your slate is clean.</p>
              <p className="text-slate-300 text-xs">Add your first priority below.</p>
            </motion.div>
          )}

          {activeTasks.map((task, index) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="group p-5 rounded-3xl flex items-center gap-4 shadow-sm border border-slate-100 bouncy-hover"
              style={{ 
                backgroundColor: `${currentTheme.colors[index % 3]}15` // 15 is hex for ~8% opacity
              }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={() => toggleTask(task.id)}
                className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white text-transparent hover:border-emerald-400 hover:text-emerald-400 transition-all"
              >
                <Check size={18} strokeWidth={3} />
              </motion.button>
              <span className="flex-1 font-medium text-slate-700">{task.text}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Add Task Form */}
      <footer className="sticky bottom-8">
        <form onSubmit={addTask} className="relative">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            disabled={!canAddTask}
            placeholder={canAddTask ? "What's next?" : "Three is enough for now."}
            className="w-full p-5 pr-16 rounded-3xl bg-white shadow-xl border border-slate-100 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-300"
            style={{ 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              opacity: !canAddTask ? 0.5 : 1,
              cursor: !canAddTask ? 'not-allowed' : 'text'
            }}
          />
          <button
            type="submit"
            disabled={!canAddTask || !newTaskText.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
            style={{ 
              backgroundColor: canAddTask && newTaskText.trim() ? 'var(--theme-primary)' : '#f1f5f9',
              color: canAddTask && newTaskText.trim() ? 'white' : '#cbd5e1',
              boxShadow: canAddTask && newTaskText.trim() ? `0 10px 15px -3px ${currentTheme.colors[0]}40` : 'none'
            }}
          >
            <Plus size={24} />
          </button>
        </form>
        {!canAddTask && (
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-xs text-slate-400 mt-3 italic"
          >
            Finish one task before adding more. You've got this!
          </motion.p>
        )}
      </footer>

      {/* Theme Modal */}
      <AnimatePresence>
        {showThemes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowThemes(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 max-h-[80vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">Pick a Vibe</h2>
                <button 
                  onClick={() => setShowThemes(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setCurrentTheme(theme);
                      setShowThemes(false);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      currentTheme.id === theme.id ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <span className="font-medium text-slate-700">{theme.name}</span>
                    <div className="flex gap-1">
                      {theme.colors.map((color, i) => (
                        <div 
                          key={i} 
                          className="w-6 h-6 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 max-h-[80vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">Past Wins</h2>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {pastTasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 italic">
                    No completed tasks yet.
                  </div>
                ) : (
                  pastTasks.map(task => (
                    <div key={task.id} className="p-4 rounded-2xl bg-slate-50 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-pastel-green/20 text-pastel-green flex items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className="text-slate-600 line-through decoration-slate-300">{task.text}</span>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setPastTasks([])}
                className="mt-6 text-xs text-slate-400 hover:text-red-400 transition-colors self-center"
              >
                Clear History
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
