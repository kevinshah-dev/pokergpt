'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import "./globals.css";

type Opponent = {
  bet: string;
  position: string;
}

export default function PokerHandAnalyzer() {
  const [potSize, setPotSize] = useState('')
  const [communityCards, setCommunityCards] = useState('')
  const [handCards, setHandCards] = useState('')
  const [position, setPosition] = useState('')
  const [advice, setAdvice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPreflop, setIsPreflop] = useState(false)
  const [numOpponents, setNumOpponents] = useState('1')
  const [opponents, setOpponents] = useState<Opponent[]>([{ bet: '', position: '' }])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpponentChange = (index: number, field: keyof Opponent, value: string) => {
    const newOpponents = [...opponents]
    newOpponents[index][field] = value
    setOpponents(newOpponents)
  }

  const handleNumOpponentsChange = (value: string) => {
    setNumOpponents(value)
    const num = parseInt(value, 10)
    setOpponents(Array(num).fill(0).map(() => ({ bet: '', position: '' })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAdvice('')
    setIsDialogOpen(true)

    // const payload = {
    //   potSize,
    //   communityCards: isPreflop ? 'this is preflop' : communityCards,
    //   handCards,
    //   position,
    //   isPreflop,
    //   opponents
    // }
    const gptStringContent = `Total Pot Size: ${potSize}\nCommunity Cards: ${isPreflop ? 'this is preflop' : communityCards}\n My Hand Cards: ${handCards}\n My Position: ${position}\nIs Preflop: ${isPreflop}\nOpponents: ${opponents.map((opponent, index) => `Opponent ${index + 1}: Bet - ${opponent.bet}, Position - ${opponent.position}`).join('\n')}`
    console.log(gptStringContent)
    try {
      const response = await fetch('/api/analyze-poker-hand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gptStringContent }),
      });

      
      const data = await response.json()
      console.log("data", data);
      if (data.advice) {
        setAdvice(data.advice);
      } else {
        setAdvice('No advice received.');
      }
    } catch (error) {
      console.error('Error:', error)
      setAdvice('Failed to get advice. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
      <CardTitle className="flex items-center justify-between">
          <span>PokerGPT</span>
          <span className="text-2xl">
            <span className="text-red-500">♥</span>
            <span className="text-black">♠</span>
            <span className="text-red-500">♦</span>
            <span className="text-black">♣</span>
          </span>
        </CardTitle>
        <CardDescription>Enter your poker hand details to get a GPT-powered analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="preflop" 
              checked={isPreflop}
              onCheckedChange={(checked) => setIsPreflop(checked as boolean)}
            />
            <Label htmlFor="preflop">Preflop</Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="potSize">Total Pot Size</Label>
              <Input
                id="potSize"
                value={potSize}
                onChange={(e) => setPotSize(e.target.value)}
                placeholder="e.g., 1000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Your Position</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g., Button, Big Blind"
                required
              />
            </div>
          </div>
          {!isPreflop && (
            <div className="space-y-2">
              <Label htmlFor="communityCards">Community Cards</Label>
              <Input
                id="communityCards"
                value={communityCards}
                onChange={(e) => setCommunityCards(e.target.value)}
                placeholder="e.g., As Kh Qd"
                required={!isPreflop}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="handCards">Your Hand</Label>
            <Input
              id="handCards"
              value={handCards}
              onChange={(e) => setHandCards(e.target.value)}
              placeholder="e.g., Jc Td"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numOpponents">Number of Opponents</Label>
            <Select onValueChange={handleNumOpponentsChange} value={numOpponents}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select number of opponents" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {opponents.map((opponent, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`opponentBet${index}`}>Opponent {index + 1} Bet</Label>
                <Input
                  id={`opponentBet${index}`}
                  value={opponent.bet}
                  onChange={(e) => handleOpponentChange(index, 'bet', e.target.value)}
                  placeholder="e.g., 500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`opponentPosition${index}`}>Opponent {index + 1} Position</Label>
                <Input
                  id={`opponentPosition${index}`}
                  value={opponent.position}
                  onChange={(e) => handleOpponentChange(index, 'position', e.target.value)}
                  placeholder="e.g., Cut-off"
                  required
                />
              </div>
            </div>
          ))}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} >
            <DialogTrigger asChild>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Get Hand Analysis'
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] bg-white dialog-close-button-black">
              <DialogHeader>
                <DialogTitle className="text-black">PokerGPT Analysis</DialogTitle>
                <DialogDescription className="text-black">
                  Here's what our AI thinks about your hand:
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Textarea
                    value={advice}
                    readOnly
                    className="w-full h-[300px] resize-none text-black"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </form>
      </CardContent>
    </Card>
  </div>
  )
}