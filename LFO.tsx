import React, { useState, useRef } from 'react';
import MidiSelector from '../latest/MidiSelector';
import LFOCanvas from '../latest/LFOCanvas';
import type { LFOCanvasHandle } from '../latest/LFOCanvas';
import LatestDemoLFO from '../src/components/LatestDemoLFO';
import MidiKeyboard from '../src/components/MidiKeyboard';

// Extend window type for inlet_5_emanator
declare global {
    interface Window {
        inlet_5_emanator?: string;
    }
}

const NUM_CANVASES = 10; // Easily changeable for arbitrary number

const LFO: React.FC = () => {
    // Store MIDI data in state
    const [midiData, setMidiData] = useState<{ note: number; velocity: number; isCC: boolean } | null>(null);
    // Array of refs for LFOCanvas, initialized once
    const refsArray: React.RefObject<LFOCanvasHandle | null>[] = Array.from({ length: NUM_CANVASES }, () => React.createRef<LFOCanvasHandle>());
    const arpyCanvasRefs = useRef(refsArray);
    // Handler for note on
    const handleNoteOn = (note: number, velocity: number) => {
        window.inlet_5_emanator = '1';
        setMidiData({ note, velocity, isCC: false });
        arpyCanvasRefs.current.forEach(ref => {
            if (ref.current) {
                ref.current.callKasmFunction('update_canvas_data', { pitch: note, velocity, cc: false });
                ref.current.postHello();
            }
        });
    };
    // Handler for note off
    const handleNoteOff = (note: number) => {
        setMidiData({ note, velocity: 0, isCC: false });
        arpyCanvasRefs.current.forEach(ref => {
            if (ref.current) {
                ref.current.callKasmFunction('update_canvas_data', { pitch: note, velocity: 0, cc: false });
            }
        });
    };
    return (
        <div className="kasm-landing-container">
            <h1>LFO Sequence Browser and Editor Tool</h1>
            <p>
                Low Frequency Oscillators, periodically update MIDI CCs and Ableton Live mapped parameters</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0' }}>
                <button
                    className="kasm-demo-btn-download"
                    title="Download this LFO as Ableton Live 12.2 M4L device"
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = '/latest/Kasm%20LFO.amxd';
                        link.download = 'Kasm LFO.amxd';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}
                >
                    ⬇️<br/>Kasm LFO.amxd
                </button>
            </div>
            <LatestDemoLFO />
            <p>
                Pattern gallery/browser<br/>
                {arpyCanvasRefs.current.map((ref, idx) => (
                    <LFOCanvas
                        key={idx}
                        ref={ref}
                        title={`LFO Canvas ${idx + 1}`}
                        midiData={midiData}
                    />
                ))}
            </p>
            <MidiSelector/>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <MidiKeyboard onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} />
            </div>

        </div>
    );
};

export default LFO;
