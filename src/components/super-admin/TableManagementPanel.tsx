import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Database, FileText, Shield, DollarSign, Users, Building } from 'lucide-react';

const TABLE_CATEGORIES = {
  registry: {
    name: 'Registry Module',
    icon: FileText,
    color: 'blue',
    tables: [
      { name: 'permit_applications', description: 'Core permit application data', records: 'Variable' },
      { name: 'initial_assessments', description: 'Registry initial assessments', records: 'Variable' },
      { name: 'prescribed_activities', description: 'Prescribed activity definitions', records: '~100' },
      { name: 'activity_levels', description: 'Activity level classifications', records: '~5' },
      { name: 'permit_types', description: 'Available permit types', records: '~20' },
    ],
  },
  compliance: {
    name: 'Compliance Module',
    icon: Shield,
    color: 'green',
    tables: [
      { name: 'compliance_assessments', description: 'Compliance assessment records', records: 'Variable' },
      { name: 'inspections', description: 'Site inspection records', records: 'Variable' },
      { name: 'permit_activities', description: 'Permit activity tracking', records: 'Variable' },
    ],
  },
  revenue: {
    name: 'Revenue Module',
    icon: DollarSign,
    color: 'yellow',
    tables: [
      { name: 'invoices', description: 'Invoice records', records: 'Variable' },
      { name: 'fee_payments', description: 'Payment tracking', records: 'Variable' },
      { name: 'fee_calculation_audit', description: 'Fee calculation history', records: 'Variable' },
    ],
  },
  finance: {
    name: 'Finance Module',
    icon: DollarSign,
    color: 'purple',
    tables: [
      { name: 'financial_transactions', description: 'Financial transaction records', records: 'Variable' },
      { name: 'fee_structures', description: 'Fee structure definitions', records: '~50' },
      { name: 'fee_calculation_methods', description: 'Calculation method configs', records: '~10' },
    ],
  },
  core: {
    name: 'Core System',
    icon: Database,
    color: 'gray',
    tables: [
      { name: 'profiles', description: 'User profiles and roles', records: 'Variable' },
      { name: 'entities', description: 'Registered entities', records: 'Variable' },
      { name: 'documents', description: 'Document management', records: 'Variable' },
      { name: 'notifications', description: 'User notifications', records: 'Variable' },
      { name: 'audit_logs', description: 'System audit trail', records: 'Variable' },
    ],
  },
  intent: {
    name: 'Intent Registration',
    icon: Building,
    color: 'indigo',
    tables: [
      { name: 'intent_registrations', description: 'Intent registrations', records: 'Variable' },
      { name: 'intent_registration_drafts', description: 'Draft intent registrations', records: 'Variable' },
    ],
  },
};

export function TableManagementPanel() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = Object.entries(TABLE_CATEGORIES).map(([key, category]) => ({
    key,
    ...category,
    tables: category.tables.filter(
      table =>
        table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.tables.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Tables
        </CardTitle>
        <CardDescription>Browse and manage all database tables organized by module</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Accordion type="multiple" className="w-full">
          {filteredCategories.map(({ key, name, icon: Icon, color, tables }) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                  <span className="font-semibold">{name}</span>
                  <Badge variant="outline">{tables.length} tables</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {tables.map((table) => (
                    <div
                      key={table.name}
                      className="p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono font-semibold">
                              {table.name}
                            </code>
                            <Badge variant="secondary" className="text-xs">
                              {table.records} records
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {table.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tables found matching "{searchTerm}"
          </div>
        )}
      </CardContent>
    </Card>
  );
}
