import {
  useNumberInput
} from '@chakra-ui/react';

interface ItemAmountProps {
  amount: number;
  onChange: (value: number) => void;
}

const ItemAmount: React.FC<ItemAmountProps> =({ amount, onChange })=> {
    const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
      useNumberInput({
        step: 1,
        value: amount,
        min: 0,
        max: 6,
        onChange: (valueString, valueNumber) => onChange(valueNumber),
      })
  
    const inc = getIncrementButtonProps()
    const dec = getDecrementButtonProps()
    const input = getInputProps()
  
    return (
      <div className="flex border-[2px] border-[#095d44] rounded-md h-full outline-none no-caret">
        <button className="w-[30%]" {...dec}>-</button>
          <input className="w-[40%] h-full flex text-center outline-none no-caret" {...input} />
        <button className="w-[30%]" {...inc}>+</button>
      </div>
    )
  }

  export default ItemAmount;