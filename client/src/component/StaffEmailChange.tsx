import { Button } from "@/components/ui/button";
import React from "react";

interface EmailChangeProps {
  email: string,
  name: string
}

const StaffEmailChange : React.FC<EmailChangeProps> = ({email, name}) => {
  return (
    <div className="flex-row">
      <p className="inline">{email}</p>
      <p className="inline">{name}</p>
      <Button className="inline ml-3">Edit Password</Button>
      <Button className="inline ml-3" variant="destructive">Delete</Button>
    </div>
  )
}

export default StaffEmailChange;