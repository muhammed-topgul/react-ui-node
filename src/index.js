import React from 'react';
import ReactDOM from 'react-dom/client';
import FlowCanvas from './App';
import {ReactFlowProvider} from "reactflow";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ReactFlowProvider>
        <FlowCanvas/>
    </ReactFlowProvider>
);
