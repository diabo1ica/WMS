import { backendApi } from '@/assets/backend';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';

import {
  Card,
  Image,
  CardBody,
  Heading,
  Text,
  CardFooter,
} from '@chakra-ui/react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useNavigate } from 'react-router-dom';

interface StaffProps {
  email: string,
  name: string,
}

const StaffCard: React.FC<StaffProps> = ({ email, name }) => {
  const matches = useMediaQuery('(min-width:800px)');

  const [isDialogProfileOpen, setDialogProfileOpen] = useState(false);
  const openDialogProfile = () => setDialogProfileOpen(true);
  const closeDialogProfile = () => setDialogProfileOpen(false);
  const [isDialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const openDialogDelete = () => setDialogDeleteOpen(true);
  const closeDialogDelete = () => setDialogDeleteOpen(false);

  const handleDialogProfileOpen = () => {
    setDialogProfileOpen(!isDialogProfileOpen);
  }

  return (
      <Card
        className="hover:cursor-pointer hover:border-[1.5px] hover:bg-[#f5f3ea]"
        sx={{ display: 'flex', backgroundColor: 'white', border:'', borderRadius:'15px', height: '100px' }}
        direction={{ base: 'column', sm: 'row' }}
        overflow='hidden'
        variant='outline'
      >
      
      <Image
        objectFit='cover'
        maxW={{ base: '100%', sm: '200px' }}
        src='https://images.unsplash.com/photo-1667489022797-ab608913feeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60'
        alt='Caffe Latte'
      />
        <CardBody isTruncated maxWidth="100%">
          <Heading size='md'>{name}</Heading>
          <Text py='2'>{email}</Text>
        </CardBody>

        <section>
          <CardFooter className="gap-2 h-full">
            <Dialog open={isDialogProfileOpen} onOpenChange={handleDialogProfileOpen}> 
              <DialogTrigger asChild onClick={openDialogProfile}>
                {matches ? 
                  <Button className="bg-[#837ef3] my-auto">
                    Edit Profile
                  </Button>  :
                  <Button className="bg-[#837ef3] my-auto">
                    Edit
                  </Button>
              }
              
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you are done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value="Pedro Duarte" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input id="username" value="@peduarte" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={closeDialogProfile}>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogDeleteOpen} onOpenChange={() => setDialogDeleteOpen(!isDialogDeleteOpen)}>
            <DialogTrigger asChild onClick={openDialogDelete}><Button className="bg-[#ff5f2d] my-auto">
              Delete
            </Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently remove this staff account
                    and remove its data from our servers. This staff will go home and cry because 
                    he / she can no longer earn money.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button type="submit" onClick={closeDialogDelete}>Confirm Action</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </section>
    </Card>
  )
}

interface StaffProp {
  pk: number,
  username: string,
  role: string,
}

const YourStaff = () => {
  const navigate = useNavigate()

  const [staff, setStaff] = useState<StaffProp[]>([])

  const handleAddKitchenStaff = () => {
    navigate('/addstaff', { state: { role: 'Kitchen'}})
  }

  const handleAddWaitStaff = () => {
    navigate('/addstaff', { state: { role: 'Wait'}})
  }

  useEffect(() => {
    fetch(`${backendApi}/api/listallstaff/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else if (response.status === 401) {
        alert('You are not the manager.')
      } else {
        alert('Unforseen error')
      }
    })
    .then(data => {
      setStaff(data.Response);
    })
  }, [])

  return (
    <div className="p-2 bg-white rounded-lg py-2 px-5 grid xl:grid-cols-2 gap-10 h-screen overflow-y-auto">
      <div className="flex flex-col w-full gap-5">
        {/* kitchen staff render */}
        <section className="flex place-items-center gap-3">
          <h1 className="font-bold text-3xl text-gray-900 leading-relaxed">Kitchen Staff</h1>
          <Button variant="secondary" className="bg-[#1caf7a] text-white" onClick={handleAddKitchenStaff}>Add Kitchen Staff</Button>    
        </section>
        
          {/* render list should be here*/}
          <section className="flex flex-col w-full gap-5 justify-center">
          {staff.map((item) => (
            (item.role === 'Kitchen') &&
              <div key={item.pk}>
                <StaffCard email={item.username} name={item.username}/>
              </div>
          ))}
          </section>
        
      </div>

      <div className="flex flex-col w-full gap-5 mt-12 lg:mt-0">
      {/* wait staff render */}
        <section className="flex place-items-center gap-3">
          <h1 className="font-bold text-3xl text-gray-900 leading-relaxed">Wait Staff</h1>
          <Button variant="secondary" className="bg-[#1caf7a] text-white" onClick={handleAddWaitStaff}>Add Wait Staff</Button>
        </section>
          {/* render list should be here*/}
          <section className="flex flex-col w-full gap-5 justify-center">
          {staff.map((item) => (
            (item.role === 'Wait') &&
              <div key={item.pk}>
                {/* <StaffEmailChange email={item.email} name={item.name}/> */}
                <StaffCard email={item.username} name={item.username}/>
              </div>
          ))}
          </section>
      </div>
    </div>
  )
}

export default YourStaff;