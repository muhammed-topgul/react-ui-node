import React, {useCallback, useEffect, useState} from "react";
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    MiniMap,
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

const newRandom = (from, to) => {
    return Math.floor(Math.random() * (from - to + 1)) + to;
}

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
    const spacing = 25;
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
const otherNodes = generateNodes(0).filter(n => n.type !== "networkNode");

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
    const {project, fitView} = useReactFlow();

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
                eds.concat({
                    ...params,
                    animated: true,
                    type: "smoothstep",
                    label: `${params.sourceHandle}⇄${params.targetHandle}`
                })
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
            position
        };
        setNodes((nds) => nds.concat(newNode));
    }, [nodes.length, project]);

    const getHandle = (node, network) => {
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
        return {sourceHandle, targetHandle};
    }

    const organizeEdges = () => {
        const network = nodes.find(n => n.type === "networkNode");
        if (!network) return;
        return nodes
            .filter(n => n.type === "normalNode" || n.type === "extraNode")
            .map((node) => {
                const selected = selectedLabel === `edge-${network.id}-${node.id}`;
                const {sourceHandle, targetHandle} = getHandle(node, network);
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
    }

    useEffect(() => {
        const network = nodes.find(n => n.type === "networkNode");
        if (!network) return;

        setEdges((prevEdges) => {
            const existingEdgeIds = new Set(prevEdges.map(e => e.id));
            const newEdges = [];

            nodes
                .filter(n => n.type === "normalNode")
                .forEach(node => {
                    const edgeId = `edge-${network.id}-${node.id}`;
                    if (existingEdgeIds.has(edgeId)) return;
                    const {sourceHandle, targetHandle} = getHandle(node, network);
                    newEdges.push({
                        id: edgeId,
                        source: network.id,
                        sourceHandle,
                        target: node.id,
                        targetHandle,
                        type: "smoothstep",
                        animated: true,
                        label: `${sourceHandle}⇄${targetHandle}`,
                        style: {strokeWidth: 1.5},
                        labelBgStyle: {cursor: "pointer"},
                    });
                });
            return [...prevEdges, ...newEdges];
        });
    }, [nodes.length]);

    useEffect(() => {
        if (nodes.length > 0) {
            setTimeout(() => fitView({duration: 600, padding: 0.5}), 100);
        }
    }, [nodes.length]);

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
                    zIndex: 1000,
                    position: "absolute",
                    top: 10,
                    left: 10,
                    padding: "6px 10px",
                    background: "rgba(0,0,0,0.7)",
                    color: "white",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                }}>
                <div>
                    <button
                        style={{background: "#f40b0b", borderRadius: 10, cursor: "pointer"}}
                        onClick={() => {
                            const copyNodes = [...nodes];
                            setNodes([...copyNodes.slice(0, copyNodes.length - 1)])
                        }}>Remove
                    </button>
                    <button
                        style={{background: "#08ea49", borderRadius: 10, cursor: "pointer"}}
                        onClick={() => {
                            newRandom();
                            const id = (nodes.length + 1).toString();
                            const newNode = {
                                id,
                                type: "normalNode",
                                data: {label: `Extra ${id}`},
                                position: {x: newRandom(-1000, 2000), y: newRandom(50, 500)}
                            };
                            setNodes((nds) => nds.concat(newNode));
                        }}>Add
                    </button>
                    <button
                        style={{background: "#0871ea", color: "#fff", borderRadius: 10, cursor: "pointer"}}
                        onClick={() => setEdges(organizeEdges())}>Organize
                    </button>
                    <button
                        style={{background: "#151619", color: "#fff", borderRadius: 10, cursor: "pointer"}}
                        onClick={() => fitView({duration: 600, padding: 0.5})}>Fit View
                    </button>
                </div>
                <br/>
                🖱 x: {mousePos.x}, y: {mousePos.y}
                {selectedLabel && (
                    <div style={{marginTop: 10, color: "#d6e3eb"}}>
                        <strong>Label:</strong> {selectedLabel}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlowCanvas;
