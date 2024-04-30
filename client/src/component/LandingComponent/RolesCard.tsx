import * as React from "react";
interface RolesType {
  icon: React.ElementType;
  title: string;
  description: string;
}

const RolesCard: React.FC<RolesType> = ({ icon: Icon, title, description }) => {
  return (
    <div className="max-w-[320px] shrink-1 z-10 border border-slate-200 flex flex-col justify-center items-center text-center p-2 gap-3 rounded-lg shadow-lg shadow-gray-500/10 bg-white h-[180px]">
      {/* Render the Icon as a React component */}
      <section>
        <Icon />
      </section>
      <section className="font-bold">{title}</section>
      <section className="">{description}</section>
    </div>
  )
}

export default RolesCard;

// https://youtu.be/xmbxe0Jtxmc