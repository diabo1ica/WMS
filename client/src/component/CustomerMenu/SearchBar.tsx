import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SearchIcon from '@mui/icons-material/Search';
 
const InputWithButton = () => {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2 bg-white-200 rounded-lg">
      <Input className="w-full text-black bg-gray-200" type="email" placeholder="Search Menu" />
      <Button className="bg-transparent border border-slate-200 shadow-none hover:bg-green-200" type="submit">
        <SearchIcon sx={{ color: 'black'}} />
      </Button>
    </div>
  )
}

export default InputWithButton;