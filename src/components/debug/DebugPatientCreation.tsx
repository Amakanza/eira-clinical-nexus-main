// Add this debugging component to test patient creation
// src/components/debug/DebugPatientCreation.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const DebugPatientCreation = () => {
  const [testData, setTestData] = useState({
    mrn: 'TEST001',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1990-01-01',
    gender: 'male',
    id_number: '9001011234088'
  });
  
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setLoading(true);
    setResult('Testing database connection...\n');
    
    try {
      // Test 1: Check if we can connect to Supabase
      const { data: connectionTest, error: connectionError } = await supabase
        .from('patients')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        setResult(prev => prev + `❌ Connection Error: ${connectionError.message}\n`);
        return;
      }
      
      setResult(prev => prev + `✅ Database connection successful\n`);
      
      // Test 2: Check table structure
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'patients' })
        .catch(() => null); // This RPC might not exist, that's OK
      
      setResult(prev => prev + `📋 Table structure check: ${tableError ? 'Could not fetch' : 'Available'}\n`);
      
      // Test 3: Try a simple insert
      setResult(prev => prev + `🔄 Attempting to insert test patient...\n`);
      
      console.log('Inserting test data:', testData);
      
      const { data: insertData, error: insertError } = await supabase
        .from('patients')
        .insert([testData])
        .select()
        .single();
      
      if (insertError) {
        setResult(prev => prev + `❌ Insert Error: ${insertError.message}\n`);
        setResult(prev => prev + `   Error Details: ${JSON.stringify(insertError, null, 2)}\n`);
        return;
      }
      
      setResult(prev => prev + `✅ Patient inserted successfully!\n`);
      setResult(prev => prev + `   Patient ID: ${insertData.id}\n`);
      setResult(prev => prev + `   Full Data: ${JSON.stringify(insertData, null, 2)}\n`);
      
      // Test 4: Try to fetch the inserted patient
      const { data: fetchData, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', insertData.id)
        .single();
      
      if (fetchError) {
        setResult(prev => prev + `❌ Fetch Error: ${fetchError.message}\n`);
      } else {
        setResult(prev => prev + `✅ Patient fetched successfully!\n`);
      }
      
      // Test 5: Clean up - delete the test patient
      const { error: deleteError } = await supabase
        .from('patients')
        .delete()
        .eq('id', insertData.id);
      
      if (deleteError) {
        setResult(prev => prev + `⚠️  Cleanup Error: ${deleteError.message}\n`);
      } else {
        setResult(prev => prev + `🧹 Test patient cleaned up successfully\n`);
      }
      
    } catch (error) {
      setResult(prev => prev + `💥 Unexpected Error: ${error}\n`);
      console.error('Debug test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAuthStatus = async () => {
    setResult('Checking authentication status...\n');
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        setResult(prev => prev + `❌ Auth Error: ${error.message}\n`);
        return;
      }
      
      if (user) {
        setResult(prev => prev + `✅ User authenticated: ${user.email}\n`);
        setResult(prev => prev + `   User ID: ${user.id}\n`);
      } else {
        setResult(prev => prev + `❌ No authenticated user\n`);
      }
    } catch (error) {
      setResult(prev => prev + `💥 Auth Check Error: ${error}\n`);
    }
  };

  const testRLSPolicies = async () => {
    setResult('Testing Row Level Security policies...\n');
    
    try {
      // Try to select from patients table
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .limit(5);
      
      if (error) {
        setResult(prev => prev + `❌ RLS Policy Error: ${error.message}\n`);
        setResult(prev => prev + `   This might indicate RLS is blocking access\n`);
      } else {
        setResult(prev => prev + `✅ RLS allows SELECT: Found ${data?.length || 0} patients\n`);
      }
    } catch (error) {
      setResult(prev => prev + `💥 RLS Test Error: ${error}\n`);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🔧 Patient Database Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mrn">MRN</Label>
            <Input
              id="mrn"
              value={testData.mrn}
              onChange={(e) => setTestData(prev => ({ ...prev, mrn: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={testData.first_name}
              onChange={(e) => setTestData(prev => ({ ...prev, first_name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={testData.last_name}
              onChange={(e) => setTestData(prev => ({ ...prev, last_name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="id_number">ID Number</Label>
            <Input
              id="id_number"
              value={testData.id_number}
              onChange={(e) => setTestData(prev => ({ ...prev, id_number: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testAuthStatus} variant="outline">
            Check Auth
          </Button>
          <Button onClick={testRLSPolicies} variant="outline">
            Test RLS
          </Button>
          <Button onClick={testDatabaseConnection} disabled={loading}>
            {loading ? 'Testing...' : 'Test Database'}
          </Button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md">
          <h4 className="font-semibold mb-2">Debug Output:</h4>
          <pre className="whitespace-pre-wrap text-sm">{result || 'Click a test button to see results...'}</pre>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="font-semibold mb-2">🔍 What to check:</h4>
          <ul className="text-sm space-y-1">
            <li>• Is your Supabase URL and key correct in environment variables?</li>
            <li>• Are you authenticated? (Check Auth button)</li>
            <li>• Do RLS policies allow your user to insert? (Test RLS button)</li>
            <li>• Does the patients table exist with the right schema?</li>
            <li>• Are there any foreign key constraints causing issues?</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
