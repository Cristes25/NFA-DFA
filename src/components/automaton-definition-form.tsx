"use client";

import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Trash2, PlusCircle } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import React from 'react';
import { EPSILON } from '@/lib/types';

export const automatonSchema = z.object({
  type: z.enum(['DFA', 'NFA']),
  states: z.string().min(1, 'At least one state is required.'),
  alphabet: z.string().min(1, 'At least one alphabet symbol is required.'),
  startState: z.string().min(1, 'Start state is required.'),
  acceptStates: z.string().min(1, 'At least one accept state is required.'),
  transitions: z.array(z.object({
    from: z.string().min(1, 'Required'),
    input: z.string().min(1, 'Required'),
    to: z.string().min(1, 'Required'),
  })),
});

type AutomatonFormProps = {
  form: UseFormReturn<z.infer<typeof automatonSchema>>;
  onSubmit: (data: z.infer<typeof automatonSchema>) => void;
};

export function AutomatonDefinitionForm({ form }: AutomatonFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'transitions',
  });

  const states = form.watch('states').split(',').map(s => s.trim()).filter(Boolean);
  const alphabet = form.watch('alphabet').split(',').map(s => s.trim()).filter(Boolean);
  const type = form.watch('type');
  const transitionAlphabet = type === 'NFA' ? [...alphabet, EPSILON] : alphabet;

  const acceptStates = form.watch('acceptStates').split(',').map(s => s.trim()).filter(Boolean);

  const handleAcceptStateChange = (state: string, checked: boolean) => {
    const current = new Set(acceptStates);
    if (checked) {
      current.add(state);
    } else {
      current.delete(state);
    }
    form.setValue('acceptStates', [...current].join(','), { shouldValidate: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Define Automaton</CardTitle>
        <CardDescription>Input the formal components of your finite automaton.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Automaton Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="DFA" />
                        </FormControl>
                        <FormLabel className="font-normal">DFA</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="NFA" />
                        </FormControl>
                        <FormLabel className="font-normal">NFA</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="states"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>States (Q)</FormLabel>
                    <FormControl>
                      <Input placeholder="q0,q1,q2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alphabet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alphabet (Σ)</FormLabel>
                    <FormControl>
                      <Input placeholder="a,b" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <FormField
                control={form.control}
                name="startState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start State (q₀)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={states.length === 0}>
                          <SelectValue placeholder="Select a start state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormItem>
                <FormLabel>Accept States (F)</FormLabel>
                <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-md border p-3">
                  {states.length > 0 ? states.map(state => (
                    <FormField
                      key={state}
                      control={form.control}
                      name="acceptStates"
                      render={() => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                           <FormControl>
                            <Checkbox
                              checked={acceptStates.includes(state)}
                              onCheckedChange={(checked) => handleAcceptStateChange(state, Boolean(checked))}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{state}</FormLabel>
                        </FormItem>
                      )}
                    />
                  )) : <p className="text-sm text-muted-foreground">Define states to select accept states.</p>}
                </div>
                 <FormMessage>{form.formState.errors.acceptStates?.message}</FormMessage>
              </FormItem>
            </div>
            
            <div>
              <h3 className="mb-2 text-sm font-medium">Transitions (δ)</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>Input</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                           <FormField
                            control={form.control}
                            name={`transitions.${index}.from`}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                         <TableCell>
                           <FormField
                            control={form.control}
                            name={`transitions.${index}.input`}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {transitionAlphabet.map(symbol => <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                         <TableCell>
                           <FormField
                            control={form.control}
                            name={`transitions.${index}.to`}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4"/></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ from: '', input: '', to: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Transition
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
