import { Outlet } from 'react-router-dom';
import './App.css'
import { NavBar, SideDrawer, emailsContext, loaderContext, emailswithAttachmentContext, isAuthenticatedContext } from './GlobalComponents';
import { CircularProgress, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { inbox } from './PageComponents';
import axios from 'axios';



function App() {
  //Side Drawer toggles
  const { isOpen: drawerIsOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();
  const [allMails, setallMails] = useState<inbox[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>('');
  const [nextdocumentPageToken, setnextdocumentPageToken] = useState<string>('');
  const [emailswithAttachment, setemailswithAttachment] = useState<inbox[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    // Add a request interceptor
    axios.interceptors.request.use(function (config) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = "Bearer " + token;

      }
      return config;
    });

  axios.interceptors.response.use(function (response) {

    return response;
  }, function (error) {
    if (error.response.status === 401) {
      localStorage.setItem("token", "");
      setIsAuthenticated(false);
    }
    return Promise.reject(error);
  });
  useEffect(() => {
    if (localStorage.getItem('token')) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [])



  return (
    <isAuthenticatedContext.Provider value={{ isAuthenticated: isAuthenticated, setIsAuthenticated: setIsAuthenticated }}>
      <loaderContext.Provider value={{ loading: loading, setLoading: setLoading }}>
        <emailsContext.Provider value={{ emails: allMails, setEmail: setallMails, nextPageToken: nextPageToken, setNextPageToken: setNextPageToken }}>
          <emailswithAttachmentContext.Provider value={{ emails: emailswithAttachment, setEmail: setemailswithAttachment, nextPageToken: nextdocumentPageToken, setNextPageToken: setnextdocumentPageToken }}>
            <NavBar openDrawer={openDrawer} />
            <SideDrawer open={drawerIsOpen} closeDrawer={closeDrawer} />
            <Outlet />
            {loading && <div className='loaderContainer'><CircularProgress className='loader' isIndeterminate color='blue.300' /></div>}

          </emailswithAttachmentContext.Provider>
        </emailsContext.Provider>
      </loaderContext.Provider>
    </isAuthenticatedContext.Provider>
  )
}

export default App
