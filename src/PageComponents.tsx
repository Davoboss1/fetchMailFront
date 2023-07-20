import { AttachmentIcon, ChevronRightIcon, EmailIcon } from "@chakra-ui/icons";
import { Avatar, Button, Card, CardBody, FormControl, FormLabel, HStack, Heading, Input, InputGroup, InputRightElement, Select, SimpleGrid, StackDivider, Text, VStack, useToast } from "@chakra-ui/react";
import gmail_img from "./assets/gmail.jpg"
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { HOST, emailsContext, emailswithAttachmentContext, isAuthenticatedContext, loaderContext } from "./GlobalComponents";
import { Link, Navigate, useLocation } from "react-router-dom";
import {  useGoogleLogin } from "@react-oauth/google";

const Home = () => {
    const toast = useToast();
    const { isAuthenticated, setIsAuthenticated } = useContext(isAuthenticatedContext);
    const login = useGoogleLogin({
        enable_serial_consent: false,
        flow: 'auth-code',
        onSuccess: (response) => {
            axios.get(HOST + "/get_token/?code=" + response.code).then((res) => {
                const access_token = res.data.fetch_mail.access_token;
                if (access_token) {
                    toast({
                        title: `You've been successfully authenticated`,
                        status: 'success',
                        isClosable: true,
                    });
                    localStorage.setItem('token', access_token);
                    setIsAuthenticated(true)

                } else {
                    toast({
                        title: `An error occured, Please try again`,
                        status: 'error',
                        isClosable: true,
                    });
                }
            }).catch(() => {
                toast({
                    title: `Something went wrong, Please try again`,
                    status: 'error',
                    isClosable: true,
                });
            })
        },
        scope: "https://www.googleapis.com/auth/gmail.readonly",

    });

    return (
        <HStack className="home-container" height={"550px"} marginX={10} marginY={5} borderRadius={5}>
            <VStack className="gradient-bg" borderRadius={5} justifyContent={"center"} spacing={5} paddingLeft={"20px"} alignItems={"flex-start"} height={"550px"} maxWidth={"450px"} width={"100%"}>
                <Heading as={"h4"} size={"2xl"} marginTop={10} color={"white"}>Welcome to FetchMail. </Heading>
                <Heading as={"h6"} size={"md"} color={"white"}>Improve your emails from gmail. </Heading>
                <Text color="white">Where you can quicky scan all your important emails fast and easily</Text>
                <HStack spacing={10}>
                    {!isAuthenticated ?
                        (
                            <Button onClick={() => login()} variant="solid">
                                Sign in with your Google account
                            </Button>
                        )
                        :
                        (
                            <Button onClick={() => login()} variant="solid">
                                You are signed in.
                            </Button>
                        )
                    }

                </HStack>
            </VStack >
            <img className="main-img" src={gmail_img} />
        </HStack >
    )
}

export type inbox = {
    id: string,
    snippet: string,
    message: string,
    subject: string,
    attachment: string,
    attachment_type: string,
    from: string
}

const Inbox = () => {

    const { emails, setEmail, nextPageToken, setNextPageToken } = useContext(emailsContext);
    const { loading, setLoading } = useContext(loaderContext);
    const toast = useToast();

    useEffect(() => {
        setLoading(true);
        if (emails.length < 1) {
            axios.get(HOST).then((response) => {
                setEmail(response.data.messages);
                setNextPageToken(response.data.nextPageToken);
                setLoading(false)
            }).catch(() => {

                toast({
                    title: `An error occured, Please try again`,
                    status: 'error',
                    isClosable: true,
                });
                setLoading(false)
            })
        }
        else { setLoading(false) }

    }, [])

    const loadMoreInbox = () => {
        setLoading(true)

        axios.get(HOST + '/next_page/' + nextPageToken + '/').then((response) => {

            setEmail([...emails, ...response.data.messages]);
            setNextPageToken(response.data.nextPageToken);
            setLoading(false)
        }).catch(() => {

            toast({
                title: `An error occured, Please try again`,
                status: 'error',
                isClosable: true,
            });
            setLoading(false)
        })
    }


    return (
        <VStack marginX={"auto"} marginY={"10px"} padding={"20px"} minHeight={100} shadow={"2xl"} maxWidth={"1000px"} >
            {emails.map((inbox: inbox, index) => (
                <Link key={index} to={inbox.attachment ? '/inbox/attachment/' : '/inbox/view_mail/'} state={{ inbox: inbox }}>

                    <HStack borderBottom={"1px"} width={"100%"} borderBottomColor={"#bdbdbd"} margin={"10px"}>
                        <EmailIcon boxSize={5} />
                        <VStack align={"flex-start"} marginLeft={"15px"} paddingY={"10px"} maxW={"70%"}>
                            <Heading as={"h6"} size={"md"}>
                                {inbox.attachment && <AttachmentIcon marginRight={"10px"} />}

                                {inbox.subject}</Heading>
                            <Text fontSize={12} fontWeight={'bold'}>
                                From: {inbox.from}
                            </Text>
                            <Text fontSize={"sm"}>{inbox.snippet}.</Text>
                        </VStack>
                        <ChevronRightIcon marginLeft={"auto"} boxSize={8} marginRight={"2%"} />
                    </HStack>
                </Link>
            ))}

            {!loading && (
                <Button bgColor={'blackAlpha.900'} textColor={'white'} colorScheme="black" onClick={loadMoreInbox}>
                    Load More Messages
                </Button>
            )}

        </VStack>

    )
};

const MailBody = () => {
    const location = useLocation();
    let inbox: inbox = location.state ? location.state.inbox : null;
    if (!inbox) {
        return (<Navigate to='/inbox/' />)
    }


    return (
        <VStack marginX={"auto"} marginY={"10px"} padding={"20px"} minHeight={100} shadow={"2xl"} maxWidth={"1000px"} >
            <Heading borderBottom={'1px solid #c1c1c1'} paddingBottom={5} as={"h6"} size={"md"} textAlign={'center'}>
                {inbox.attachment && <AttachmentIcon marginRight={"10px"} />}
                {inbox.subject}
            </Heading>

            <Text fontWeight={'bold'} fontSize={15}>
                From: {inbox.from}
            </Text>



            <div dangerouslySetInnerHTML={{ __html: inbox.message }} />

        </VStack>
    )

}


export const MailBodyForm = () => {
    const { setLoading } = useContext(loaderContext);

    const location = useLocation();
    let inbox: inbox = location.state ? location.state.inbox : null;
    if (!inbox) {
        return (<Navigate to='/inbox/' />)
    }


    const toast = useToast();

    const [content, setcontent] = useState('');
    const [inputvalues, setinputvalues] = useState({
        name: '',
        address: '',
        date_of_birth: '',
        email: '',
        dates: '',
        url: '',
        phone_no: ''
    });

    const [attachmentSourceUrl] = useState(readBase64(inbox.attachment, inbox.attachment_type));
    const [matched_address, setmatched_address] = useState<string[]>([]);
    const [matched_date_of_birth, setmatched_date_of_birth] = useState<string[]>([]);
    const [matched_email, setmatched_email] = useState<string[]>([]);
    const [matched_phone, setmatched_phone] = useState<string[]>([]);
    const [matched_date, setmatched_date] = useState<string[]>([]);
    const [matched_name, setmatched_name] = useState<string[]>([]);
    const [matched_url, setmatched_url] = useState<string[]>([]);

    //Regex patterns
    const email_regex = /[a-z0-9]+[_a-z0-9\.-]*[a-z0-9]+@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})/gm
    const url_regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gm
    const date_regex = /\d{2}\/\d{2}\/\d{2,4}/gm
    const phone_no_regex = /(\(?\+?\d{1,3}\)?[\s-]+)?\(?\d{1,3}\)?[\s-]+\d{3}[\s-]?\d{2}[\s-]?\d{2}/gm

    useEffect(() => {
        setLoading(true)

        axios.get(HOST + '/attachment/' + inbox.id + '/').then((response) => {
            console.log(response.data)
            setcontent(response.data.value)
            let [email, url, dates, phone_no] = applyContent(response.data.value);
            let [name,address,date_of_birth] = applyInfo(response.data.info);
            setinputvalues({
                name: name && name[0],
                address: address && address[0],
                date_of_birth: date_of_birth && date_of_birth[0],
                email: email && email[0],
                url: url && url[0],
                dates: dates && dates[0],
                phone_no: phone_no && phone_no[0]
            })
            

        }).catch(() => {
            
            toast({
                title: `An error occured, Please try again`,
                status: 'error',
                isClosable: true,
            });
            setLoading(false)
        })

    }, [])

    const applyInfo = (response_data: any) => {
        let names: string[] = [];
        let address: string[] = [];
        let birth_date: string[] = [];
        response_data.forEach((info: any) => {

            info = info.amazon;

            if (info.status === "success") {
                let data = info.extracted_data;

                data.forEach((item: any) => {
                    let name = "";
                    item.given_names.forEach((element: any) => {
                        name += (" " + element.value)
                    });
                    if (item.last_name.value) {
                        names.push(name + " " + item.last_name.value);
                    }
                    if (item.address.value) {
                        address.push(item.address.value);
                    }
                    if (item.birth_date.value) {
                        birth_date.push(item.birth_date.value);
                    }

                })
            }
        });
        setmatched_name([...matched_name, ...names])
        setmatched_address([...matched_address, ...address])
        setmatched_date_of_birth([...matched_date_of_birth, ...birth_date])
        
        return [names,address,birth_date]
    }
    const applyContent = (content: string) => {
        console.log(content);

        const regexes = [email_regex, url_regex, date_regex, phone_no_regex]
        const values = []

        for (let index = 0; index < regexes.length; index++) {
            const regex = regexes[index];
            let array;
            let total: string[] = [];

            while ((array = regex.exec(content)) !== null) {

                let str = array[0];
                if(index===1 && str.match(email_regex)){
                    continue;
                }
                total.push(str);
            }
            values[index] = total;
        }

        let current_matched_email = values[0];
        let current_matched_url = values[1];
        let current_matched_date = values[2];
        let current_matched_phone = values[3];
        
        setmatched_email([...matched_email, ...current_matched_email]);
        setmatched_url([...matched_url, ...current_matched_url]);
        setmatched_date([...matched_date, ...current_matched_date]);
        setmatched_phone([...matched_phone, ...current_matched_phone]);

        setLoading(false);
        return [current_matched_email, current_matched_url,current_matched_date, current_matched_phone]
    };

    const SubmitForm = (event: any) => {
        event.preventDefault();
        setLoading(true)
        const formData = new FormData(event.currentTarget);
        axios.post(HOST + '/create_attachment/', formData).then(() => {
            toast({
                title: `Form Submitted successfully`,
                status: 'success',
                isClosable: true,
            });
            setinputvalues({
                address: '',
                date_of_birth: '',
                dates: '',
                email: '',
                name: '',
                phone_no: '',
                url: ''
            })
            setLoading(false)

        })
    }

    const SingleInput = (label: string, name: string, onchange: (value: string) => void, value: string, selectValues: string[]) => (
        <FormControl marginTop={"10px"}>
            <FormLabel>{label}</FormLabel>
            <InputGroup>
                <InputRightElement>
                    <Select onChange={(event) => onchange(event.target.value)} placeholder="Select option">
                        {selectValues.map((item) => (
                            <option>{item}</option>
                        ))}
                    </Select>
                </InputRightElement>
                <Input required name={name} onChange={(event) => onchange(event.target.value)} value={value} />
            </InputGroup>

        </FormControl>
    )


    return (
        <HStack wrap={"wrap"} alignContent={'center'} marginX={"auto"} marginY={"10px"} padding={"20px"} alignItems={'flex-start'} minHeight={100} shadow={"2xl"} maxWidth={"1000px"} >
            <VStack marginX={'auto'} marginBottom={"auto"} width={'100%'} maxWidth={'650px'}>


                <Heading textAlign={'center'} as={"h6"} size={"md"}>
                    {<AttachmentIcon marginRight={"15px"} boxSize={10} />}
                    {inbox.subject}
                </Heading>
                <Text fontWeight={'bold'} fontSize={15}>
                    From: {inbox.from}
                </Text>


                <div style={{ marginLeft: '5px', marginRight: '5px' }} dangerouslySetInnerHTML={{ __html: inbox.message }} />

                <hr style={{ backgroundColor: '#c1c1c1', width: '90%', margin: 10 }} />
                {inbox.message.length <= 1000 && (
                    <div style={{ border: '1px solid #c1c1c1' }}>
                        {inbox.attachment_type.includes("image") ? 
                        <img src={attachmentSourceUrl} />
                        :
                        <object className="document-view" data={attachmentSourceUrl} />
                        }
                    </div>
                )}



            </VStack>
            <VStack marginX={'auto'} width={'100%'} maxWidth={'300px'}>
                <Button onClick={() => (downloadBase64(inbox.attachment, inbox.attachment_type))}>
                    Download Attachment</Button>
                <form onSubmit={SubmitForm}>
                    {SingleInput('Name', "Full_Name", (value) => setinputvalues({ ...inputvalues, name: value }), inputvalues.name, matched_name)}

                    {SingleInput('Address', "Address", (value) => setinputvalues({ ...inputvalues, address: value }), inputvalues.address, matched_address)}
                    {SingleInput('Date of birth', "DOB", (value) => setinputvalues({ ...inputvalues, date_of_birth: value }), inputvalues.date_of_birth, matched_date_of_birth)}
                    {SingleInput('Email', "Email", (value) => setinputvalues({ ...inputvalues, email: value }), inputvalues.email, matched_email)}

                    {SingleInput('Date', "dates", (value) => setinputvalues({ ...inputvalues, dates: value }), inputvalues.dates, matched_date)}

                    {SingleInput('Phone Number', "Phone_number", (value) => setinputvalues({ ...inputvalues, phone_no: value }), inputvalues.phone_no, matched_phone)}

                    {SingleInput('Url', "urls", (value) => setinputvalues({ ...inputvalues, url: value }), inputvalues.url, matched_url)}
                    <Button type="submit" width={"100%"} marginTop={5} bgColor={'blackAlpha.900'} textColor={'white'} colorScheme="black">
                        Submit Form
                    </Button>
                </form>


            </VStack>
        </HStack>

    )

}

function readBase64(base64string: string, type: string) {

    function fixBase64(data: string) {
        var base64str = data// base64 string from  thr response of server
        var binary = atob(base64str.replace(/\s/g, ''));// decode base64 string, remove space for IE compatibility
        var len = binary.length;         // get binary length
        var buffer = new ArrayBuffer(len);         // create ArrayBuffer with binary length
        var view = new Uint8Array(buffer);         // create 8-bit Array

        // save unicode of binary data into 8-bit Array
        for (var i = 0; i < len; i++)
            view[i] = binary.charCodeAt(i);

        return view;
    }

    var base64 = (base64string).replace(/_/g, '/'); //Replace this characters 
    base64 = base64.replace(/-/g, '+');
    var base64Fixed = fixBase64(base64);
    var blob = new Blob([base64Fixed], { type: type }); //set your file type!
    return URL.createObjectURL(blob);
}

function downloadBase64(base64string: string, type: string){
    window.open(readBase64(base64string,type), '_blank')
}

const Documents = () => {
    const { loading, setLoading } = useContext(loaderContext);
    const { emails, setEmail, nextPageToken, setNextPageToken } = useContext(emailswithAttachmentContext);
    const toast = useToast();

    useEffect(() => {
        setLoading(true);
        if (emails.length < 1) {
            axios.get(HOST + '/with_attachment/').then((response) => {
                setEmail(response.data.messages);
                setNextPageToken(response.data.nextPageToken);

                setLoading(false)
            }).catch(() => {

                toast({
                    title: `An error occured, Please try again`,
                    status: 'error',
                    isClosable: true,
                });
                setLoading(false)
            })
        }
        else { setLoading(false) }
    }, [])

    const loadMoreInbox = () => {
        setLoading(true)

        axios.get(HOST + '/next_page_with_attachment/' + nextPageToken + '/').then((response) => {

            setEmail([...emails, ...response.data.messages]);
            setNextPageToken(response.data.nextPageToken);
            setLoading(false)
        }).catch(() => {

            toast({
                title: `An error occured, Please try again`,
                status: 'error',
                isClosable: true,
            });
            setLoading(false)
        })
    }

    return (
        <VStack>
            <SimpleGrid columns={{ sm: 2, md: 3, lg: 4 }} spacing={5} marginX={"auto"} marginY={"10px"} padding={"20px"} shadow={"2xl"} maxWidth={"1100px"}>
                {emails.map((inbox) => (
                    <Link to={'/inbox/attachment/'} state={{ inbox: inbox }}>
                        <Card border={"1px solid #c1c1c1"}>
                            <CardBody display={"flex"} flexDirection={"column"} alignItems={"center"} >
                                <AttachmentIcon boxSize={50} />
                                <Text textAlign={"center"} marginTop={"10px"}>
                                    {inbox.subject}
                                </Text>
                                <Text textAlign={"center"} fontSize={12} fontWeight={'bold'} marginTop={"auto"} paddingTop={'5px'}>
                                    From: {inbox.from}
                                </Text>
                            </CardBody>
                        </Card>
                    </Link>

                ))}

            </SimpleGrid>
            {!loading && (
                <Button bgColor={'blackAlpha.900'} textColor={'white'} colorScheme="black" onClick={loadMoreInbox}>
                    Load More Attachment
                </Button>
            )}

        </VStack>
    );
}

const Profile = () => {
    const toast = useToast();
    const { setLoading } = useContext(loaderContext);

    const [User, setUser] = useState({
        email: '',
        first_name: '',
        last_name: '',
        username: ''
    });

    useEffect(() => {
        setLoading(true)

        axios.get(HOST + '/get_user/').then((response) => {
            setUser(response.data);
            setLoading(false)

        }).catch(() => {
            toast({
                title: `An error occured, Please try again`,
                status: 'error',
                isClosable: true,
            });
            setLoading(false)
        })
    }, [])


    return (
        <VStack maxWidth={"800px"} marginX={"auto"} boxShadow={"2xl"} border={"1px"} borderColor={"blackAlpha.300"} marginY={10} paddingY={5} spacing={2}>
            <Avatar size={"2xl"} />
            <StackDivider backgroundColor={"blackAlpha.300"} marginY={3} height={"1px"} />

            <Heading as={"h6"} size={"sm"} fontWeight={"bold"}>Email</Heading>
            <Text>{User.email}</Text>
            <hr style={{ backgroundColor: "black", }} />
            <Heading as={"h6"} size={"sm"} fontWeight={"bold"}>UserName</Heading>
            <Text>{User.username} </Text>
            <Heading as={"h6"} size={"sm"} fontWeight={"bold"}>First Name</Heading>
            <Text>{User.first_name} </Text>
            <Heading as={"h6"} size={"sm"} fontWeight={"bold"}>Last Name</Heading>
            <Text>{User.last_name} </Text>

        </VStack>
    )
};

const SavedDetailsView = () => {
    type detail = {
        Full_Name: string,
        Address: string,
        Email: string,
        Phone_number: string,
        DOB: string,
        dates: string,
        urls: string
    }
    const toast = useToast();
    const { setLoading } = useContext(loaderContext);

    const [Data, setData] = useState<detail[]>([]);
    useEffect(() => {
        setLoading(true)

        axios.get(HOST + '/list_attachment/').then((response) => {
            setData(response.data);
            setLoading(false)

        }).catch(() => {
            toast({
                title: `An error occured, Please try again`,
                status: 'error',
                isClosable: true,
            });
            setLoading(false)
        })
    }, [])

    return (<HStack wrap={'wrap'} justifyContent={'center'} margin={10}>
        {Data.map((detail) => (
            <VStack backgroundColor={'whitesmoke'} margin={5} padding={10} borderRadius={10}>
                <Text>
                    <b>Full Name:</b> {detail.Full_Name}
                </Text>
                <Text>
                    <b>Address:</b> {detail.Address}
                </Text>
                <Text>
                    <b>Email: </b> {detail.Email}
                </Text>
                <Text>
                    <b>Phone Number: </b> {detail.Phone_number}
                </Text>
                <Text>
                    <b>Date of Birh: </b> {detail.DOB}
                </Text>
                <Text>
                    <b>Dates: </b> 1{detail.dates}
                </Text>
                <Text>
                    <b>Urls: </b> {detail.urls}
                </Text>
            </VStack>
        ))}


    </HStack>);
}

export { Home, Inbox, Documents, Profile, MailBody, SavedDetailsView }