import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Copy, Volume2 } from "lucide-react";
import { useGeminiAI } from "@/hooks/use-gemini-ai";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccentConversion {
  ipa: string;
  english: string;
  hinglish: string;
  paragraphNumber: number;
  accent: 'US' | 'UK';
}

export function BookUploadConverter() {
  const [textInput, setTextInput] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [selectedAccent, setSelectedAccent] = useState<'US' | 'UK'>('US');
  const [conversions, setConversions] = useState<AccentConversion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { generateAccentConversion } = useGeminiAI();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("File:", file);
    if (file && (file.type === 'text/plain' || file.type === 'application/pdf')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        console.log("File content:", content);
        setFileContent(content);
        setTextInput(content);
        toast({ title: "File uploaded successfully!" });
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .pdf file",
        variant: "destructive"
      });
    }
  };

  const processText = async () => {
    if (!textInput.trim()) {
      toast({ title: "Please enter some text", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const paragraphs = textInput.split('\n\n').filter(p => p.trim());
      const conversions: AccentConversion[] = [];

      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i].trim();
        if (paragraph) {
          const result = await generateAccentConversion({
            text: paragraph,
            accent: selectedAccent,
            paragraphNumber: i + 1
          });
          
          conversions.push({
            ipa: result.ipa,
            english: paragraph,
            hinglish: result.hinglish,
            paragraphNumber: i + 1,
            accent: selectedAccent
          });
        }
      }

      setConversions(conversions);
      toast({ title: "Conversion completed!" });
    } catch (error) {
      toast({ 
        title: "Processing failed", 
        description: "Please try again", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Book/Article Accent Converter
          </CardTitle>
          <CardDescription>
            Upload your favorite book or paste text to get US/UK accent pronunciation guides
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Text File (.txt)</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              {fileContent && <Badge>File loaded</Badge>}
            </div>
          </div>

          {/* Accent Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Accent</label>
            <Select value={selectedAccent} onValueChange={(value) => setSelectedAccent(value as 'US' | 'UK')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">🇺🇸 US Accent</SelectItem>
                <SelectItem value="UK">🇬🇧 UK Accent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Or Paste Your Text</label>
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your article or book excerpt here..."
              className="min-h-[200px]"
            />
          </div>

          <Button 
            onClick={processText} 
            disabled={isProcessing || !textInput.trim()}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Convert to Accent Guide"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {conversions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Accent Conversion Results</h3>
          {conversions.map((conversion, index) => (
            <Card key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {conversion.accent === 'US' ? '🇺🇸' : '🇬🇧'} {conversion.accent} Accent – Paragraph {conversion.paragraphNumber}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">IPA:</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(conversion.ipa)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="bg-white p-3 rounded font-mono text-sm">
                    /{conversion.ipa}/
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">English:</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(conversion.english)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="bg-white p-3 rounded">
                    {conversion.english}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Hinglish Pronunciation:</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(conversion.hinglish)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="bg-white p-3 rounded text-lg font-devanagari">
                    {conversion.hinglish}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}