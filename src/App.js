import React, {useCallback, useEffect, useState} from "react";
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    useReactFlow,
} from "react-flow-renderer";
import "react-flow-renderer/dist/style.css";
import NormalNode from "./NormalNode";
import NetworkNode from "./NetworkNode";
import ExtraNode from "./ExtraNode";

const backendNodes = [
    {id: "0", type: "networkNode", data: {label: "Network"}},
    {id: "1", type: "normalNode", data: {label: "Node-1"}},
    {id: "2", type: "normalNode", data: {label: "Node-2"}},
    {id: "3", type: "normalNode", data: {label: "Node-3"}},
    {id: "4", type: "normalNode", data: {label: "Node-4"}},
    {id: "5", type: "normalNode", data: {label: "Node-5"}},
];

const generateNodes = (size) => {
    const nodes = [...backendNodes];
    for (let i = 5; i < size + 5; i++) {
        nodes.push({id: i + "", type: "normalNode", data: {label: "Node-" + i}})
    }
    return nodes;
}

function generateCircularPositions(nodes, center) {
    const nodeCount = nodes.length;

    const minRadius = 150;
    const spacing = 25; // her node için ekstra mesafe
    const radius = minRadius + nodeCount * spacing * 0.5;

    const angleStep = (2 * Math.PI) / nodeCount;

    return nodes.map((node, index) => {
        const angle = index * angleStep;

        return {
            ...node,
            position: {
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle),
            },
        };
    });
}


const networkNode = backendNodes.find(n => n.type === "networkNode");
const otherNodes = generateNodes(5).filter(n => n.type !== "networkNode");

const positionedOtherNodes = generateCircularPositions(otherNodes, {x: 600, y: 300});

const initialNodes = [
    {...networkNode, position: {x: 600, y: 300}},
    ...positionedOtherNodes
];

const nodeTypes = {
    networkNode: NetworkNode,
    normalNode: NormalNode,
    extraNode: ExtraNode
};

function FlowCanvas() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState([]);
    const [mousePos, setMousePos] = useState({x: 0, y: 0});
    const [selectedLabel, setSelectedLabel] = useState(null);
    const {project} = useReactFlow();

    const onNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds))
    }, []);

    const onConnect = useCallback((params) => {
        const networkId = "0";
        if (params.source === networkId || params.target === networkId) {
            setEdges((eds) =>
                eds.concat({...params, animated: true, type: "smoothstep", label: "Java"})
            );
        }
    }, []);

    const handleMouseMove = useCallback((event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const position = project({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
        });
        setMousePos({x: Math.round(position.x), y: Math.round(position.y)});
    }, [project]);

    const handleContextMenu = useCallback((event) => {
        event.preventDefault();
        const bounds = event.currentTarget.getBoundingClientRect();
        const position = project({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
        });

        const id = (nodes.length + 1).toString();
        const newNode = {
            id,
            type: "extraNode",
            data: {label: `Extra ${id}`},
            position,
            style: {
                width: 100,
                height: 50,
                background: "#90EE90",
                color: "#000",
                border: "1px solid #FFA500",
                borderRadius: 10,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "8px",
            },
        };
        setNodes((nds) => nds.concat(newNode));
    }, [nodes.length, project]);

    useEffect(() => {
        const network = nodes.find(n => n.type === "networkNode");
        if (!network) return;

        const newEdges = nodes
            .filter(n => n.type === "normalNode")
            .map((node) => {
                const dx = node.position.x - network.position.x;
                const dy = node.position.y - network.position.y;

                let sourceHandle, targetHandle;

                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) {
                        sourceHandle = "right";
                        targetHandle = "left";
                    } else {
                        sourceHandle = "left";
                        targetHandle = "right";
                    }
                } else {
                    if (dy > 0) {
                        sourceHandle = "bottom";
                        targetHandle = "top";
                    } else {
                        sourceHandle = "top";
                        targetHandle = "bottom";
                    }
                }

                const selected = selectedLabel === `edge-${network.id}-${node.id}`;

                return {
                    id: `edge-${network.id}-${node.id}`,
                    source: network.id,
                    sourceHandle,
                    target: node.id,
                    targetHandle,
                    type: "smoothstep",
                    animated: true,
                    label: `${sourceHandle}⇄${targetHandle}`,
                    style: {
                        strokeWidth: selected ? 2.5 : 1,
                        stroke: selected ? "#0c0d0c" : ""
                    },
                    labelBgStyle: {cursor: "pointer"},
                };
            });

        setEdges(newEdges);
    }, [nodes, selectedLabel]);

    const onEdgeClick = useCallback((event, edge) => {
        event.stopPropagation();
        if (selectedLabel === edge.id) {
            setSelectedLabel(null);
            return;
        }
        setSelectedLabel(edge.id);
    }, [selectedLabel]);

    return (
        <div style={{height: "100vh", position: "relative"}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onMouseMove={handleMouseMove}
                onContextMenu={handleContextMenu}
                onEdgeClick={onEdgeClick}
                fitView>
                <MiniMap/>
                <Controls/>
                <Background gap={8}/>
            </ReactFlow>

            <div
                style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    padding: "6px 10px",
                    background: "rgba(0,0,0,0.7)",
                    color: "white",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                }}>
                🖱 x: {mousePos.x}, y: {mousePos.y}
                {selectedLabel && (
                    <div style={{marginTop: 10, color: "#d6e3eb"}}>
                        <strong>Seçilen Label:</strong> {selectedLabel}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <ReactFlowProvider>
            <FlowCanvas/>
        </ReactFlowProvider>
    );
}
