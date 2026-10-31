import React, { useState } from 'react';
import { Play, CheckCircle, Clock, AlertTriangle, FileCode, Terminal, GitCommit, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

export default function CodingAgentPanel({ backendUrl }) {
  const [prompt, setPrompt] = useState('EL, build me a complete hotel management system with PHP, MySQL, admin dashboard, room booking and payment integration.');
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState(null);
  const [executingStepId, setExecutingStepId] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);

  const generatePlan = async () => {
    if (!prompt.trim() || loading) return;
    cyberAudio.confirm();
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/agent/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: prompt })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTaskData(data);
      if (data.plan && data.plan.length > 0) {
        setSelectedStep(data.plan[0]);
      }
    } catch (err) {
      cyberAudio.alert();
      alert(`Error generating plan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeStep = async (stepId, userApproved = true) => {
    if (!taskData || executingStepId) return;
    cyberAudio.confirm();
    setExecutingStepId(stepId);
    try {
      const res = await fetch(`${backendUrl}/agent/execute-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskData.task_id,
          step_id: stepId,
          user_approved: userApproved
        })
      });
      const data = await res.json();
      
      setTaskData((prev) => {
        const newPlan = prev.plan.map((s) => {
          if (s.id === stepId) {
            return {
              ...s,
              status: data.status,
              output: data.result
            };
          }
          return s;
        });
        return { ...prev, plan: newPlan };
      });

      setSelectedStep((prev) => {
        if (prev?.id === stepId) {
          return {
            ...prev,
            status: data.status,
            output: data.result
          };
        }
        return prev;
      });
    } catch (err) {
      cyberAudio.alert();
      alert(`Execution failed: ${err.message}`);
    } finally {
      setExecutingStepId(null);
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'create_file':
      case 'edit_file':
        return <FileCode size={16} color="var(--neon-cyan)" />;
      case 'run_command':
      case 'run_test':
        return <Terminal size={16} color="var(--neon-green)" />;
      case 'git_commit':
        return <GitCommit size={16} color="var(--neon-pink)" />;
      default:
        return <Sparkles size={16} color="var(--neon-yellow)" />;
    }
  };

  return (
    <div style={{ margin: '0 20px', height: 'calc(100vh - 110px)', display: 'grid', gridTemplateColumns: '460px 1fr', gap: '16px', position: 'relative', zIndex: 5 }}>
      {/* Left Column: Mission Directives & Step Pipeline */}
      <div className="cyber-panel" style={{ display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 className="font-cyber neon-text-cyan" style={{ fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} /> // MISSION ARCHITECT
          </h2>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-yellow)' }}>
            AUTO_SANDBOX: SECURE
          </span>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            SYSTEM DIRECTIVE // SPECIFICATION
          </label>
          <textarea
            id="agent-goal-input"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Command EL to build, refactor, test or deploy software..."
            style={{
              width: '100%',
              background: 'rgba(8, 16, 32, 0.9)',
              border: '1px solid var(--border-subtle)',
              padding: '10px 12px',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-hud)',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.4
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--neon-cyan)', e.target.style.boxShadow = '0 0 10px rgba(0, 242, 254, 0.25)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)', e.target.style.boxShadow = 'none')}
          />
          <button
            id="btn-plan-task"
            className="btn-cyber-primary"
            style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}
            onClick={generatePlan}
            disabled={loading}
          >
            {loading ? 'SYNTHESIZING ARCHITECTURE...' : 'DECONSTRUCT & GENERATE PIPELINE'}
          </button>
        </div>

        {/* Steps List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', display: 'flex', justifyContent: 'space-between' }}>
            <span>// EXECUTION SEQUENCE</span>
            <span>{taskData?.plan ? `${taskData.plan.length} OPERATIONS` : 'IDLE'}</span>
          </div>

          {!taskData && (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
              Awaiting directive. Click "DECONSTRUCT & GENERATE PIPELINE" to break down user requirements into automated file, command, test, and git steps.
            </div>
          )}

          {taskData?.plan?.map((step) => {
            const isSelected = selectedStep?.id === step.id;
            const isCompleted = step.status === 'completed';
            const isRunning = executingStepId === step.id;

            return (
              <div
                key={step.id}
                id={`step-card-${step.id}`}
                onClick={() => { cyberAudio.click(); setSelectedStep(step); }}
                style={{
                  background: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(8, 14, 28, 0.85)',
                  border: `1px solid ${isSelected ? 'var(--neon-cyan)' : 'var(--border-subtle)'}`,
                  borderLeft: `3px solid ${isCompleted ? 'var(--neon-green)' : step.requires_approval ? 'var(--neon-yellow)' : isSelected ? 'var(--neon-cyan)' : 'var(--border-subtle)'}`,
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 15px rgba(0, 242, 254, 0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                    {getActionIcon(step.action_type)}
                    <span style={{ fontFamily: 'var(--font-hud)', letterSpacing: '0.02em' }}>{step.id}. {step.title}</span>
                  </div>

                  {isCompleted ? (
                    <CheckCircle size={16} color="var(--neon-green)" />
                  ) : isRunning ? (
                    <Clock size={16} className="animate-spin" color="var(--neon-cyan)" />
                  ) : (
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>QUEUED</span>
                  )}
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                  {step.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--neon-cyan)' }}>
                    TYPE // {step.action_type.toUpperCase()}
                  </span>

                  {step.requires_approval && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--neon-yellow)', background: 'rgba(255, 230, 0, 0.1)', padding: '2px 6px', border: '1px solid var(--neon-yellow)', borderRadius: '2px' }}>
                      <ShieldAlert size={12} /> APPROVAL_GATE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Step Inspector & Action Runner */}
      <div className="cyber-panel cyber-panel-yellow" style={{ display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden' }}>
        {selectedStep ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--neon-yellow)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  OP_ID #{selectedStep.id} // {selectedStep.action_type.toUpperCase()}
                </div>
                <h3 className="font-cyber neon-text-cyan" style={{ fontSize: '18px', fontWeight: 700 }}>{selectedStep.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{selectedStep.description}</p>
              </div>

              <div>
                {selectedStep.requires_approval && selectedStep.status !== 'completed' ? (
                  <button
                    id={`btn-approve-step-${selectedStep.id}`}
                    className="btn-cyber-primary btn-cyber-pink"
                    onClick={() => executeStep(selectedStep.id, true)}
                    disabled={executingStepId !== null}
                  >
                    <ShieldAlert size={15} /> AUTHORIZE & EXECUTE
                  </button>
                ) : (
                  <button
                    id={`btn-exec-step-${selectedStep.id}`}
                    className="btn-cyber-primary"
                    onClick={() => executeStep(selectedStep.id, true)}
                    disabled={executingStepId !== null || selectedStep.status === 'completed'}
                  >
                    <Play size={15} /> {selectedStep.status === 'completed' ? 'RE-DISPATCH STEP' : 'EXECUTE STEP'}
                  </button>
                )}
              </div>
            </div>

            {/* Step Payload & Execution Trace */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', marginBottom: '8px' }}>
                  // ACTION PAYLOAD & PARAMS
                </h4>
                <pre style={{ background: '#02050c', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--neon-cyan)', padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#7dd3fc', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                  {JSON.stringify(selectedStep.details, null, 2)}
                </pre>
              </div>

              {selectedStep.output && (
                <div>
                  <h4 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', marginBottom: '8px' }}>
                    // EXECUTION LOG & VERIFICATION RESULT
                  </h4>
                  <pre style={{ background: '#020e06', border: '1px solid rgba(0, 255, 136, 0.3)', borderLeft: '3px solid var(--neon-green)', padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#86efac', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                    {JSON.stringify(selectedStep.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
            [SELECT AN OPERATION STEP TO INSPECT CONFIGURATION & EXECUTE]
          </div>
        )}
      </div>
    </div>
  );
}
