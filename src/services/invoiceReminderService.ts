import { supabase } from '@/integrations/supabase/client';
import { sendEmail } from '@/services/emailService';
import { sendSMS } from '@/services/smsService';

export const checkAndSendInvoiceReminders = async () => {
  try {
    // Get current date
    const now = new Date();
    
    // Find invoices that are 7 days overdue (first reminder)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDayOverdueInvoices = await getOverdueInvoices(sevenDaysAgo, 'first');
    
    // Find invoices that are 14 days overdue (second reminder)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fourteenDayOverdueInvoices = await getOverdueInvoices(fourteenDaysAgo, 'second');
    
    // Process all overdue invoices
    await processReminders(sevenDayOverdueInvoices, 'first');
    await processReminders(fourteenDayOverdueInvoices, 'second');
    
    console.log('Invoice reminder processing completed');
  } catch (error) {
    console.error('Error processing invoice reminders:', error);
    throw error;
  }
};

const getOverdueInvoices = async (dueDate: Date, reminderType: 'first' | 'second') => {
  // Check if reminder was already sent for this invoice and type
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      payment_reminders!inner(
        id,
        reminder_type,
        sent_at
      ),
      appointments!inner(
        patient_name,
        patient_id,
        clinician_name,
        date,
        duration,
        type
      )
    `)
    .eq('status', 'issued')
    .lt('due_date', dueDate.toISOString())
    .not('payment_reminders.reminder_type', 'eq', reminderType);

  if (error) {
    console.error(`Error fetching ${reminderType} reminder invoices:`, error);
    throw error;
  }

  return invoices || [];
};

const processReminders = async (invoices: any[], reminderType: 'first' | 'second') => {
  for (const invoice of invoices) {
    try {
      // Get patient contact info (simplified - would need actual implementation)
      const patient = await getPatientContactInfo(invoice.appointments.patient_id);
      
      // Send reminders
      await sendReminder(invoice, patient, reminderType);
      
      // Record reminder in database
      await supabase
        .from('payment_reminders')
        .insert({
          invoice_id: invoice.id,
          reminder_type: reminderType,
          delivery_status: 'sent'
        });
      
      console.log(`Sent ${reminderType} reminder for invoice ${invoice.id}`);
    } catch (error) {
      console.error(`Error processing ${reminderType} reminder for invoice ${invoice.id}:`, error);
      
      // Record failed attempt
      await supabase
        .from('payment_reminders')
        .insert({
          invoice_id: invoice.id,
          reminder_type: reminderType,
          delivery_status: 'failed'
        });
    }
  }
};

const getPatientContactInfo = async (patientId: string) => {
  // In a real implementation, this would fetch patient contact details
  // For now returning mock data
  return {
    email: 'patient@example.com',
    phone: '+1234567890',
    name: 'Test Patient'
  };
};

const sendReminder = async (invoice: any, patient: any, reminderType: 'first' | 'second') => {
  const subject = `Reminder: Invoice #${invoice.id} is overdue`;
  const message = `Dear ${patient.name},\n\n` +
    `This is a ${reminderType} reminder that your invoice for the appointment on ` +
    `${new Date(invoice.appointments.date).toLocaleDateString()} is overdue.\n\n` +
    `Amount due: $${invoice.amount.toFixed(2)}\n` +
    `Payment link: https://example.com/pay/${invoice.payment_token}\n\n` +
    `Please make payment at your earliest convenience.\n\n` +
    `Thank you,\nThe Clinic Team`;

  // Send email
  await sendEmail({
    to: patient.email,
    subject,
    text: message
  });

  // Send SMS if phone number exists
  if (patient.phone) {
    await sendSMS({
      to: patient.phone,
      body: message.substring(0, 160) // Truncate to SMS length limit
    });
  }
};

// Schedule to run daily at 9am
export const scheduleReminderService = () => {
  // In a real implementation, this would use a proper scheduler like node-cron
  // For now, we'll just export the function to be called manually or by another scheduler
  console.log('Invoice reminder service ready to be scheduled');
};
