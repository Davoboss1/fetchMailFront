import { Box, Button, Drawer, DrawerCloseButton, DrawerContent, DrawerOverlay, Heading, IconButton, VStack } from '@chakra-ui/react'
import { AttachmentIcon, CalendarIcon, EditIcon, EmailIcon, HamburgerIcon, InfoIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { createContext } from 'react';
import { inbox } from './PageComponents';

const emailsContext = createContext<{emails: inbox[], setEmail: Function,  nextPageToken: string, setNextPageToken: Function}>({} as any);
const emailswithAttachmentContext = createContext<{emails: inbox[], setEmail: Function, nextPageToken: string, setNextPageToken: Function}>({} as any);
const loaderContext = createContext<{loading: boolean, setLoading: Function}>({} as any);
const isAuthenticatedContext = createContext<{isAuthenticated:boolean, setIsAuthenticated: Function}>({} as any);


const NavBar = ({openDrawer}: {openDrawer: ()=>void}) => (
    <Box className='navbar'>
        <IconButton onClick={openDrawer} aria-label='Menu Icon' variant={"ghost"} colorScheme={"white"} position={"absolute"} left={"15px"} icon={<HamburgerIcon />} />
        <Heading as={"h2"} size={"md"}>
            Fetch Mail
        </Heading>
    </Box>
  )

const SideDrawer = ({open, closeDrawer}: {open: boolean, closeDrawer: () => void}) => {
    const navigate = useNavigate();
    return (
        <Drawer placement='left' isOpen={open} onClose={closeDrawer}>
            <DrawerOverlay />
            <DrawerContent bgColor={"blackAlpha.800"} className='drawer-content'>
                <DrawerCloseButton color={"white"}  />
                <VStack mt={"50px"} paddingX={"15px"}>
                    <Heading as={"h6"} size="sm" marginBottom={"15px"} color={"white"}>Select Action</Heading>
                    
                    <Button onClick={()=>navigate("/")} marginBottom={"10px"} width={"100%"} variant={"outline"} color={"white"}colorScheme='whiteAlpha' leftIcon={<CalendarIcon />}>  Home</Button>

                    
                    
                    <Button onClick={()=>navigate("inbox/")} marginBottom={"10px"} width={"100%"} variant={"outline"} color={"white"}colorScheme='whiteAlpha' leftIcon={<EmailIcon />}>  Inbox</Button>
                    <Button  onClick={()=>navigate("documents/")} marginBottom={"10px"} width={"100%"} variant={"outline"} color={"white"}colorScheme='whiteAlpha' leftIcon={<AttachmentIcon />}>  Documents</Button>
                    <Button onClick={()=>navigate("profile/")} marginBottom={"10px"} width={"100%"} variant={"outline"} color={"white"}colorScheme='whiteAlpha' leftIcon={<EditIcon />}>  User</Button>
                    <Button onClick={()=>navigate("saved/")} marginBottom={"10px"} width={"100%"} variant={"outline"} color={"white"}colorScheme='whiteAlpha' leftIcon={<InfoIcon />}>  Saved Details</Button>
                </VStack>
            </DrawerContent>
        </Drawer>
    )
}

export const HOST = 'https://fetchmail.pythonanywhere.com'


export { NavBar, SideDrawer, emailsContext, loaderContext, emailswithAttachmentContext,isAuthenticatedContext}