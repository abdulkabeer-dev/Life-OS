import React, { useState } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { Plus, Trash2, ExternalLink, Award, Code2, Share2, Briefcase } from 'lucide-react';

const Portfolio: React.FC = () => {
  const { data, addPortfolioItem, deletePortfolioItem, addCertification, deleteCertification, addSkill, deleteSkill, addLink, deleteLink } = useLifeOS();
  
  const [section, setSection] = useState<'projects' | 'skills' | 'certs'>('projects');
  
  // Forms
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLink, setProjLink] = useState('');
  
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState(50);
  
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');

  const handleAddProj = () => {
      if(!projTitle) return;
      addPortfolioItem({ title: projTitle, description: projDesc, link: projLink });
      setProjTitle(''); setProjDesc(''); setProjLink('');
  };

  const handleAddSkill = () => {
      if(!skillName) return;
      addSkill({ name: skillName, level: skillLevel });
      setSkillName(''); setSkillLevel(50);
  };

  const handleAddCert = () => {
      if(!certName) return;
      addCertification({ name: certName, issuer: certIssuer, date: certDate });
      setCertName(''); setCertIssuer(''); setCertDate('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Header / Socials */}
        <div className="glass-card rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">My Portfolio</h2>
                <p className="text-gray-400">Manage your professional presence and assets.</p>
            </div>
            <div className="flex gap-3">
                {data.portfolio.links.map(l => (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="p-3 rounded-lg bg-bg-tertiary hover:bg-accent hover:text-white transition-all">
                        <Share2 size={20} />
                    </a>
                ))}
                <button className="p-3 rounded-lg bg-bg-tertiary border border-dashed border-gray-600 hover:border-accent hover:text-accent transition-all">
                    <Plus size={20} />
                </button>
            </div>
        </div>

        {/* Navigation */}
        <div className="flex bg-bg-tertiary p-1 rounded-lg w-fit">
            <button onClick={() => setSection('projects')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${section === 'projects' ? 'bg-bg-primary shadow text-white' : 'text-gray-400 hover:text-white'}`}>Projects</button>
            <button onClick={() => setSection('skills')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${section === 'skills' ? 'bg-bg-primary shadow text-white' : 'text-gray-400 hover:text-white'}`}>Skills</button>
            <button onClick={() => setSection('certs')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${section === 'certs' ? 'bg-bg-primary shadow text-white' : 'text-gray-400 hover:text-white'}`}>Certifications</button>
        </div>

        {/* Content */}
        {section === 'projects' && (
            <div className="space-y-6">
                 <div className="glass-card rounded-xl p-6 border border-accent/20">
                    <h3 className="font-semibold mb-4 text-accent">Add Project</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={projTitle} onChange={e => setProjTitle(e.target.value)} placeholder="Project Title" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                        <input value={projLink} onChange={e => setProjLink(e.target.value)} placeholder="Project Link (Optional)" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                        <textarea value={projDesc} onChange={e => setProjDesc(e.target.value)} placeholder="Description" className="md:col-span-2 p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none h-20" />
                    </div>
                    <button onClick={handleAddProj} className="mt-4 bg-accent px-6 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors">Add Project</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.portfolio.items.map(item => (
                        <div key={item.id} className="glass-card rounded-xl p-5 hover:border-accent/50 transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{item.title}</h3>
                                {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-accent"><ExternalLink size={18} /></a>}
                            </div>
                            <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                            <button onClick={() => deletePortfolioItem(item.id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-xs flex items-center gap-1">
                                <Trash2 size={12} /> Remove
                            </button>
                        </div>
                    ))}
                    {data.portfolio.items.length === 0 && <p className="col-span-full text-center text-gray-500 py-10">Showcase your work here.</p>}
                </div>
            </div>
        )}

        {section === 'skills' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="glass-card rounded-xl p-6 h-fit">
                    <h3 className="font-semibold mb-4 text-accent">Add Skill</h3>
                    <input value={skillName} onChange={e => setSkillName(e.target.value)} placeholder="Skill Name (e.g. React)" className="w-full mb-4 p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                    <label className="text-xs text-gray-400 mb-1 block">Proficiency: {skillLevel}%</label>
                    <input type="range" min="0" max="100" value={skillLevel} onChange={e => setSkillLevel(parseInt(e.target.value))} className="w-full mb-4 accent-accent" />
                    <button onClick={handleAddSkill} className="w-full bg-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors">Add Skill</button>
                 </div>

                 <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {data.portfolio.skills.map(skill => (
                         <div key={skill.id} className="glass-card rounded-xl p-4 flex items-center gap-4 group">
                             <div className="p-3 rounded-lg bg-bg-tertiary text-blue-400"><Code2 size={20} /></div>
                             <div className="flex-1">
                                 <div className="flex justify-between mb-1">
                                     <span className="font-medium">{skill.name}</span>
                                     <button onClick={() => deleteSkill(skill.id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                 </div>
                                 <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                                     <div className="h-full bg-blue-500 rounded-full" style={{ width: `${skill.level}%` }}></div>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        )}

        {section === 'certs' && (
             <div className="space-y-6">
                 <div className="glass-card rounded-xl p-6 border border-accent/20">
                    <h3 className="font-semibold mb-4 text-accent">Add Certification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input value={certName} onChange={e => setCertName(e.target.value)} placeholder="Certification Name" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                        <input value={certIssuer} onChange={e => setCertIssuer(e.target.value)} placeholder="Issuer (e.g. Google)" className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                        <input type="date" value={certDate} onChange={e => setCertDate(e.target.value)} className="p-3 rounded-lg bg-bg-tertiary border border-border focus:border-accent outline-none" />
                    </div>
                    <button onClick={handleAddCert} className="mt-4 bg-accent px-6 py-2 rounded-lg font-medium hover:bg-accent/80 transition-colors">Add Cert</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.portfolio.certifications.map(cert => (
                        <div key={cert.id} className="glass-card rounded-xl p-5 flex items-center gap-4 group">
                             <div className="p-4 rounded-full bg-yellow-500/10 text-yellow-500"><Award size={24} /></div>
                             <div className="flex-1">
                                 <h4 className="font-bold">{cert.name}</h4>
                                 <p className="text-sm text-gray-400">{cert.issuer} • {cert.date}</p>
                             </div>
                             <button onClick={() => deleteCertification(cert.id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 p-2"><Trash2 size={18} /></button>
                        </div>
                    ))}
                </div>
             </div>
        )}
    </div>
  );
};

export default Portfolio;