import React, { useState } from 'react';
import ReactFlow, { addEdge, Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { Modal, Select, Input, Button } from 'antd';

const { Option } = Select;

function App() {
  const [nodes, setNodes] = useState([
    { id: '1', data: { label: 'Add Lead Source' }, position: { x: 250, y: 0 } },
  ]);

  

  const [edges, setEdges] = useState([]);
  const [isLeadSourceModalOpen, setIsLeadSourceModalOpen] = useState(false);
  const [isChooseNodeModalOpen, setIsChooseNodeModalOpen] = useState(false);
  const [isColdEmailModalOpen, setIsColdEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    template: '',
    delay: 0,
  });
  const [selectedLeadSource, setSelectedLeadSource] = useState(null);
  const [currentLeadSourceId, setCurrentLeadSourceId] = useState(null);

  const handleLeadSourceClick = () => {
    setIsLeadSourceModalOpen(true);
  };

  const handleColdEmailClick = () => {
    setIsColdEmailModalOpen(true);
  };

  const handleLeadSourceSelect = (sourceType) => {
    const newLeadSourceNode = {
      id: `${nodes.length + 1}`,
      data: { label: `Leads from ${sourceType}` },
      position: { x: 250, y: nodes.length * 100 + 100 }, // Adjust position for new nodes
    };

    setNodes((prev) => [...prev, newLeadSourceNode]);
    setEdges((prev) => [
      ...prev,
      { id: `e1-${nodes.length + 1}`, source: '1', target: `${nodes.length + 1}` },
    ]);

    setCurrentLeadSourceId(`${nodes.length + 1}`);
    setIsLeadSourceModalOpen(false);
    setIsChooseNodeModalOpen(true); // Open modal to choose node type
    setSelectedLeadSource(sourceType);
  };

  const handleNodeTypeSelection = (nodeType) => {
    const newNode = {
      id: `${nodes.length + 1}`,
      data: { label: nodeType },
      position: { x: 250, y: nodes.length * 100 + 100 }, // Adjust position for new nodes
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [
      ...prev,
      { id: `e${currentLeadSourceId}-${nodes.length + 1}`, source: currentLeadSourceId, target: `${nodes.length + 1}` },
    ]);

    setIsChooseNodeModalOpen(false);

    if (nodeType === 'Cold Email') {
      setIsColdEmailModalOpen(true); // Open email configuration modal for cold email
    }
  };

  const handleEmailSubmit = () => {
    // Update the nodes as per the email data
    setNodes((prev) =>
      prev.map((node) =>
        node.data.label === 'Cold Email'
          ? {
              ...node,
              data: {
                ...node.data,
                label: `Cold Email\nRecipient: ${emailData.to}\nTemplate: ${emailData.template}\nDelay: ${emailData.delay} mins`,
              },
            }
          : node
      )
    );

    // Prepare the payload to send to the backend
    const payload = {
      nodes,
      edges,
      ...emailData,
    };

    console.log('Payload being sent:', payload);

    // Send the payload to the backend
    try {
      axios.post('http://localhost:5000/api/emails/schedule', payload);
      alert('Email scheduled successfully!');
    } catch (error) {
      console.error('Failed to schedule email:', error);
      alert('Failed to schedule email');
    }

    setIsColdEmailModalOpen(false); // Close the modal after submission
  };

  return (
    <div style={{ height: '100vh' }}>
      <Button
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 10,
        }}
        type="primary"
        onClick={async () => {
          try {
            await axios.post('http://localhost:5000/api/emails/schedule', {
              nodes,
              edges,
              emailData,
            });
            alert('Email scheduled successfully!');
          } catch (error) {
            console.error('Error scheduling email:', error);
            alert('Failed to schedule email');
          }
        }}
      >
        Save and Schedule
      </Button>

      <h2>Email Scheduler with React Flow</h2>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(event, node) => {
          if (node.data.label === 'Add Lead Source') handleLeadSourceClick();
          else if (node.data.label === 'Cold Email') handleColdEmailClick();
        }}
        style={{ width: '100%', height: '90%' }}
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>

      {/* Lead Source Modal */}
      <Modal
        title="Select Lead Source"
        open={isLeadSourceModalOpen}
        onCancel={() => setIsLeadSourceModalOpen(false)}
        footer={null}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select Lead Source Type"
          onChange={handleLeadSourceSelect}
        >
          <Option value="List">Leads from List(s)</Option>
          <Option value="Event">Segment by Events</Option>
          <Option value="CRM">CRM Integration</Option>
        </Select>
      </Modal>

      {/* Choose Node Modal */}
      <Modal
        title="Choose Node Type"
        open={isChooseNodeModalOpen}
        onCancel={() => setIsChooseNodeModalOpen(false)}
        footer={null}
      >
        <Button
          type="primary"
          style={{ marginBottom: '10px', width: '100%' }}
          onClick={() => handleNodeTypeSelection('Cold Email')}
        >
          Add Cold Email Node
        </Button>
        <Button
          type="default"
          style={{ width: '100%' }}
          onClick={() => handleNodeTypeSelection('Task')}
        >
          Add Task Node
        </Button>
      </Modal>

      {/* Cold Email Modal */}
      <Modal
        title="Configure Cold Email"
        open={isColdEmailModalOpen}
        onCancel={() => setIsColdEmailModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsColdEmailModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="ok" type="primary" onClick={handleEmailSubmit}>
            OK
          </Button>,
        ]}
      >
        <Input
          placeholder="Recipient's Email"
          value={emailData.to}
          onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
        />
        <Select
          placeholder="Select Email Template"
          style={{ width: '100%', marginTop: '10px' }}
          onChange={(value) => setEmailData({ ...emailData, template: value })}
        >
          <Option value="template1">Template 1</Option>
          <Option value="template2">Template 2</Option>
        </Select>
        <Select
          placeholder="Select Delay (minutes)"
          style={{ width: '100%', marginTop: '10px' }}
          onChange={(value) => setEmailData({ ...emailData, delay: value })}
        >
          <Option value={10}>10 minutes</Option>
          <Option value={20}>20 minutes</Option>
          <Option value={30}>30 minutes</Option>
        </Select>
      </Modal>
    </div>
  );
}

export default App;
