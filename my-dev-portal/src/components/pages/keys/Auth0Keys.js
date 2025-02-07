import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { PageLayout } from "../../page-layout";
import Modal from "react-modal";
import { PageLoader } from "../../page-loader";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const Auth0Keys = () => {
  const { user: auth0User, isLoading: auth0IsLoading, getAccessTokenSilently } = useAuth0();
  const [APIKey, setAPIKey] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);

  let isLoading = auth0IsLoading;
  let userEmail = auth0User?.email;

  Modal.setAppElement("#root");

  async function createKey() {
    let token;
    try {
      token = await getAccessTokenSilently({
        audience: `http://127.0.0.1:3030`, // replace with your API identifier
        ignoreCache: true,
      });

      console.log(token);
    } catch(e) {
      console.error(e);
      // handle error, return, or throw e
    }

    fetch(`${process.env.REACT_APP_DEV_PORTAL_API_SERVER}/create-key`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Include the Auth0 access token in the Authorization header
      },
      body: JSON.stringify({
        email: userEmail,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create key");
        }
        return res.json();
      })
      .then((result) => {
        console.log(result);
        setAPIKey(result.apikey);
        openModal(setIsOpen);
      })
      .catch((error) => {
        setAPIKey("Error creating key:", error);
        openModal(setIsOpen);
      });
  }

  function openModal() {
    setIsOpen(true);
  }
  
  function closeModal() {
    setIsOpen(false);
  }

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <PageLayout>
      <>
        <h2 className="white-text">Keys</h2>
        <h4 className="white-text">
          On this page, you can create an API key to access the APIs that are
          protected through key-auth.
        </h4>
        <p className="white-text">
          To use the API key, add an <code>apiKey</code> header to your API
          request with the generated key as the value.
        </p>
        <p className="white-text">
          <strong>
            Note: Make sure to store the key somewhere safe as you will not be
            able to retrieve it once you close the modal.
          </strong>
        </p>
        <button className="button__purp" onClick={createKey}>
          Create Key
        </button>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="API Key"
        >
          <h2>Your API key is below!</h2>
          <pre className="black-text">{APIKey}</pre>
          <button className="button__purp" onClick={closeModal}>
            Close
          </button>
        </Modal>
      </>
    </PageLayout>
  );
}

export default Auth0Keys
