import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ChakraProvider } from '@chakra-ui/react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Documents, Home, Inbox, MailBody, MailBodyForm, Profile, SavedDetailsView } from './PageComponents.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'inbox/',
        element: <Inbox />
      },
      {
        path: 'inbox/view_mail/',
        element: <MailBody />
      },
      {
        path: 'inbox/attachment/:id/',
        element: <MailBodyForm />
      },
      {
        path: 'inbox/attachment/',
        element: <MailBodyForm />
      },
      {
        path: 'documents/',
        element: <Documents />
      },
      {
        path: 'profile/',
        element: <Profile />
      },
      {
        path: 'saved/',
        element: <SavedDetailsView />
      }

    ]

  },
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
    <ChakraProvider>
      <GoogleOAuthProvider clientId='330436072087-ml3la726ec2uai8mhn1u7fasa824s7bg.apps.googleusercontent.com'>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </ChakraProvider>
  ,
)
