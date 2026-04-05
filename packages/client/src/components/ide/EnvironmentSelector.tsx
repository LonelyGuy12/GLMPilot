import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Code2, Terminal } from 'lucide-react';

export default function EnvironmentSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-center mb-2">Select Environment</h1>
        <p className="text-center text-zinc-400 mb-10">
          Choose your project type to launch the IDE
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <EnvCard 
            title="Web Development" 
            description="HTML, CSS, JS/TS, React with Live Preview" 
            icon={<Monitor className="w-10 h-10 mb-4 text-blue-400" />}
            onClick={() => navigate('/ide/web')}
          />
          <EnvCard 
            title="Java" 
            description="Java JDK 17 with Console Output" 
            icon={<Code2 className="w-10 h-10 mb-4 text-orange-400" />}
            onClick={() => navigate('/ide/java')}
          />
          <EnvCard 
            title="Python" 
            description="Python 3 Environment with Console Output" 
            icon={<Terminal className="w-10 h-10 mb-4 text-green-400" />}
            onClick={() => navigate('/ide/python')}
          />
        </div>
      </div>
    </div>
  );
}

function EnvCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-8 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 cursor-pointer rounded-xl transition-all duration-200 shadow-sm"
    >
      {icon}
      <h3 className="text-xl font-medium mb-3">{title}</h3>
      <p className="text-sm text-center text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
