import { useState } from 'react'
import { Check, ChevronsUpDown, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface PatientSelectorProps {
  patients: any[]
  selectedId: string
  onSelect: (id: string) => void
}

export function PatientSelector({ patients, selectedId, onSelect }: PatientSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedName = patients.find((p) => p.id === selectedId)?.name

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[300px] justify-between bg-background shadow-subtle border-gray-200 rounded-lg transition-all duration-200 ease-out"
        >
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4 opacity-70" />
            {selectedName || 'Selecione um paciente...'}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar paciente..." />
          <CommandList>
            <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.name}
                  onSelect={() => {
                    onSelect(patient.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedId === patient.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {patient.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
