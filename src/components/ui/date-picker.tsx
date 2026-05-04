import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

export function DatePicker({
  value,
  onChange,
  error,
}: {
  value?: Date
  onChange: (date?: Date) => void
  error?: boolean
}) {
  const [inputValue, setInputValue] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, 'dd/MM/yyyy'))
    } else {
      setInputValue('')
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 8) val = val.slice(0, 8)

    let formatted = val
    if (val.length > 4) {
      formatted = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`
    } else if (val.length > 2) {
      formatted = `${val.slice(0, 2)}/${val.slice(2)}`
    }

    setInputValue(formatted)

    if (formatted.length === 10) {
      const parsed = parse(formatted, 'dd/MM/yyyy', new Date())
      if (isValid(parsed)) {
        onChange(parsed)
      } else {
        onChange(undefined)
      }
    } else {
      onChange(undefined)
    }
  }

  const handleSelect = (date: Date | undefined) => {
    onChange(date)
    if (date) {
      setInputValue(format(date, 'dd/MM/yyyy'))
      setIsOpen(false)
    } else {
      setInputValue('')
    }
  }

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder="DD/MM/AAAA"
        maxLength={10}
        className={cn(
          'w-full pr-10 rounded-[8px] transition-colors',
          error && 'border-destructive focus-visible:ring-destructive text-destructive',
        )}
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-0 top-0 h-full w-10 px-0 py-0 hover:bg-transparent rounded-r-[8px]',
              error ? 'text-destructive' : 'text-muted-foreground',
            )}
            type="button"
            tabIndex={-1}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            initialFocus
            locale={ptBR}
            captionLayout="dropdown"
            fromYear={1900}
            toYear={2100}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
