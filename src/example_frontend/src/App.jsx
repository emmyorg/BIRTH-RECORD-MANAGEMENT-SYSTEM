import React, { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { example_backend } from 'declarations/example_backend';
import './index.scss';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [children, setChildren] = useState([]);
  const [view, setView] = useState(''); // 'addChild', 'viewChildren', 'viewChildDetails', 'contactUs'
  const [newChild, setNewChild] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    motherName: '',
    fatherName: '',
    weight: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    birthDate: ''
  });
  const [selectedChild, setSelectedChild] = useState(null);
  const [editingChild, setEditingChild] = useState(null);
  const [message, setMessage] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const authClientPromise = AuthClient.create();

  const signIn = async () => {
    const authClient = await authClientPromise;
    const internetIdentityUrl = process.env.NODE_ENV === 'production'
      ? undefined
      : `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;

    await new Promise((resolve) => {
      authClient.login({
        identityProvider: internetIdentityUrl,
        onSuccess: () => resolve(undefined),
      });
    });

    const identity = authClient.getIdentity();
    updateIdentity(identity);
    setIsLoggedIn(true);
    setView(''); // Set to default view after sign-in
  };

  const signOut = async () => {
    const authClient = await authClientPromise;
    await authClient.logout();
    updateIdentity(null);
    setIsLoggedIn(false);
    setView('signIn'); // Redirect to sign-in page after sign-out
  };

  const updateIdentity = (identity) => {
    if (identity) {
      setPrincipal(identity.getPrincipal());
      const agent = new HttpAgent();
      const actor = Actor.createActor(example_backend, { agent: agent });
      example_backend.setActor(actor);
    } else {
      setPrincipal(null);
      example_backend.setActor(null);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const authClient = await authClientPromise;
      const isAuthenticated = await authClient.isAuthenticated();
      setIsLoggedIn(isAuthenticated);
      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        updateIdentity(identity);
      } else {
        setView('signIn'); // Redirect to sign-in page if not authenticated
      }
    };

    checkLoginStatus();
  }, []);

  const fetchChildren = async () => {
    try {
      const childrenList = await example_backend.getChildren();
      setChildren(childrenList);
    } catch (error) {
      console.error("Failed to fetch children:", error);
    }
  };

  const handleAddChild = async (event) => {
    event.preventDefault();
    try {
      if (editingChild) {
        await example_backend.updateChild(
          editingChild.id,
          newChild.firstName,
          newChild.lastName,
          newChild.gender,
          newChild.motherName,
          newChild.fatherName,
          newChild.weight,
          newChild.province,
          newChild.district,
          newChild.sector,
          newChild.cell,
          newChild.birthDate
        );
        setMessage("Child updated successfully");
      } else {
        await example_backend.addChild(
          newChild.firstName,
          newChild.lastName,
          newChild.gender,
          newChild.motherName,
          newChild.fatherName,
          newChild.weight,
          newChild.province,
          newChild.district,
          newChild.sector,
          newChild.cell,
          newChild.birthDate
        );
        setMessage("Child added successfully");
      }
      setNewChild({
        firstName: '',
        lastName: '',
        gender: '',
        motherName: '',
        fatherName: '',
        weight: '',
        province: '',
        district: '',
        sector: '',
        cell: '',
        birthDate: ''
      });
      setEditingChild(null);
      fetchChildren();
      setView('viewChildren');
    } catch (error) {
      console.error("Failed to add/update child:", error);
      setMessage("Failed to add/update child");
    }
  };

  const handleEditChild = (child) => {
    setNewChild(child);
    setEditingChild(child);
    setView('addChild');
  };

  const handleViewChild = (child) => {
    setSelectedChild(child);
    setView('viewChildDetails');
  };

  const handleDeleteChild = async (childId) => {
    if (window.confirm("Are you sure you want to delete this child?")) {
      try {
        await example_backend.deleteChild(childId);
        setMessage("Child deleted successfully");
        fetchChildren();
      } catch (error) {
        console.error("Failed to delete child:", error);
        setMessage("Failed to delete child");
      }
    }
  };

  const handleFetchChildren = () => {
    fetchChildren();
    setView('viewChildren');
  };

  const handleContactFormSubmit = async (event) => {
    event.preventDefault();
    try {
      // Handle form submission logic, e.g., send the message to the backend or an email service
      console.log("Contact form submitted:", contactForm);
      setMessage("Thank you for contacting us! We will get back to you shortly.");
      setContactForm({ name: '', email: '', message: '' });
      setView(''); // Redirect to default view after form submission
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      setMessage("Failed to submit contact form");
    }
  };

  return (
    <main className={view === 'signIn' ? 'sign-in-background' : ''}>
      <table bgcolor='#77d5e3'> <h1><i>BIRTH RECORD MANAGEMENT SYSTEM</i></h1></table>
      {message && <p className="message">{message}</p>}
      {isLoggedIn ? (
        <>
       
          <button onClick={signOut}>Sign Out</button>
          <button onClick={() => setView('addChild')}>Add New Child</button>
          <button onClick={handleFetchChildren}>View Children</button>
          <button onClick={() => setView('contactUs')}>Contact Us</button>

          {view === 'viewChildren' && (
            <>
              <h2>Child List</h2>
              <table>
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Gender</th>
                    <th>Mother's Name</th>
                    <th>Father's Name</th>
                    <th>Weight (kg)</th>
                    <th>Birth Date</th>
                    <th>Birth Place</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {children.map((child, index) => (
                    <tr key={index}>
                      <td>{child.firstName}</td>
                      <td>{child.lastName}</td>
                      <td>{child.gender}</td>
                      <td>{child.motherName}</td>
                      <td>{child.fatherName}</td>
                      <td>{child.weight}</td>
                      <td>{child.birthDate}</td>
                      <td>{`${child.province}, ${child.district}, ${child.sector}, ${child.cell}`}</td>
                      <td>
                        <button onClick={() => handleEditChild(child)}>Edit</button>
                        <button onClick={() => handleDeleteChild(child.id)}>Delete</button>
                        <button onClick={() => handleViewChild(child)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {view === 'addChild' && (
            <>
              <h2>{editingChild ? "Edit Child" : "Add New Child"}</h2>
              <form onSubmit={handleAddChild}>
                <label>
                  First Name:
                  <input
                    type="text"
                    value={newChild.firstName}
                    onChange={(e) => setNewChild({ ...newChild, firstName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Last Name:
                  <input
                    type="text"
                    value={newChild.lastName}
                    onChange={(e) => setNewChild({ ...newChild, lastName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Gender:
                  <select
                    value={newChild.gender}
                    onChange={(e) => setNewChild({ ...newChild, gender: e.target.value })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label>
                  Mother's Name:
                  <input
                    type="text"
                    value={newChild.motherName}
                    onChange={(e) => setNewChild({ ...newChild, motherName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Father's Name:
                  <input
                    type="text"
                    value={newChild.fatherName}
                    onChange={(e) => setNewChild({ ...newChild, fatherName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Weight (kg):
                  <input
                    type="number"
                    value={newChild.weight}
                    onChange={(e) => setNewChild({ ...newChild, weight: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Birth Date:
                  <input
                    type="date"
                    value={newChild.birthDate}
                    onChange={(e) => setNewChild({ ...newChild, birthDate: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Province:
                  <input
                    type="text"
                    value={newChild.province}
                    onChange={(e) => setNewChild({ ...newChild, province: e.target.value })}
                    required
                  />
                </label>
                <label>
                  District:
                  <input
                    type="text"
                    value={newChild.district}
                    onChange={(e) => setNewChild({ ...newChild, district: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Sector:
                  <input
                    type="text"
                    value={newChild.sector}
                    onChange={(e) => setNewChild({ ...newChild, sector: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Cell:
                  <input
                    type="text"
                    value={newChild.cell}
                    onChange={(e) => setNewChild({ ...newChild, cell: e.target.value })}
                    required
                  />
                </label>
                <button type="submit">{editingChild ? "Update Child" : "Save Child"}</button>
              </form>
            </>
          )}

          {view === 'viewChildDetails' && selectedChild && (
            <>
              <h2>Child Details</h2>
              <p><strong>First Name:</strong> {selectedChild.firstName}</p>
              <p><strong>Last Name:</strong> {selectedChild.lastName}</p>
              <p><strong>Gender:</strong> {selectedChild.gender}</p>
              <p><strong>Mother's Name:</strong> {selectedChild.motherName}</p>
              <p><strong>Father's Name:</strong> {selectedChild.fatherName}</p>
              <p><strong>Weight (kg):</strong> {selectedChild.weight}</p>
              <p><strong>Birth Date:</strong> {selectedChild.birthDate}</p>
              <p><strong>Birth Place:</strong> {`${selectedChild.province}, ${selectedChild.district}, ${selectedChild.sector}, ${selectedChild.cell}`}</p>
              <button onClick={() => setView('viewChildren')}>Back to List</button>
            </>
          )}

          {view === 'contactUs' && (
            <>
              <h2>Contact Us</h2>
              <form onSubmit={handleContactFormSubmit}>
                <label>
                  Name:
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Message:
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  ></textarea>
                </label>
                <button type="submit">Submit</button>
              </form>
            </>
          )}
        </>
      ) : (
        view === 'signIn' && (
          <button onClick={signIn}>Sign In</button>
        )
      )}
    </main>
  );
}

export default App;
