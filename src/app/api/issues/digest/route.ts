//
// Cron endpoint for sending daily issue report digest via email
// This endpoint is designed to be called by Vercel Cron or similar scheduler
// Schedule: Daily at 8:00 AM EST
//

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Vercel Cron configuration - runs at 8 AM EST (1 PM UTC)
export const dynamic = 'force-dynamic';

// POST - Trigger email digest (called by cron)
export async function POST(request: Request) {
    try {
        // Verify cron secret for security (optional but recommended)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get issues reported in the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const recentIssues = await prisma.issueReport.findMany({
            where: {
                reportedAt: {
                    gte: yesterday,
                },
            },
            orderBy: { reportedAt: 'desc' },
        });

        if (recentIssues.length === 0) {
            console.log('No issues to report in the last 24 hours');
            return NextResponse.json({
                success: true,
                message: 'No issues to report',
                count: 0,
            });
        }

        // Format the email content
        const emailContent = formatEmailDigest(recentIssues);

        // Send email using Resend (you'll need to set up Resend API key)
        const resendApiKey = process.env.RESEND_API_KEY;

        if (!resendApiKey) {
            console.error('RESEND_API_KEY not configured');
            // Log the digest to console as fallback
            console.log('=== ISSUE REPORT DIGEST ===');
            console.log(emailContent);
            console.log('=== END DIGEST ===');
            return NextResponse.json({
                success: true,
                message: 'Email not sent (RESEND_API_KEY not configured), logged to console',
                count: recentIssues.length,
            });
        }

        // Send email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Notova Issues <notifications@notova.app>',
                to: ['contact@andrewmindy.com'],
                subject: `[Notova] Issue Report Digest - ${recentIssues.length} new issue${recentIssues.length === 1 ? '' : 's'}`,
                html: emailContent,
            }),
        });

        if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            console.error('Failed to send email:', errorData);
            return NextResponse.json({
                success: false,
                error: 'Failed to send email digest',
                details: errorData,
            }, { status: 500 });
        }

        const emailResult = await emailResponse.json();

        return NextResponse.json({
            success: true,
            message: 'Daily digest sent successfully',
            count: recentIssues.length,
            emailId: emailResult.id,
        });
    } catch (error) {
        console.error('Error sending issue digest:', error);
        return NextResponse.json(
            { error: 'Failed to process issue digest' },
            { status: 500 }
        );
    }
}

// GET - Manual trigger or status check
export async function GET() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const count = await prisma.issueReport.count({
        where: {
            reportedAt: {
                gte: yesterday,
            },
        },
    });

    return NextResponse.json({
        pendingIssues: count,
        nextDigest: '8:00 AM EST',
        lastCheck: new Date().toISOString(),
    });
}

// Helper function to format email content
function formatEmailDigest(issues: Array<{
    id: string;
    userEmail: string;
    userId: string | null;
    category: string;
    description: string;
    status: string;
    userAgent: string | null;
    reportedAt: Date;
}>) {
    const categoryEmoji: Record<string, string> = {
        bug: '🐛',
        feature: '✨',
        other: '📝',
    };

    const issueRows = issues.map((issue, index) => `
        <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px; vertical-align: top;">
                <strong>#${index + 1}</strong>
            </td>
            <td style="padding: 12px; vertical-align: top;">
                <span style="
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    background: ${issue.category === 'bug' ? '#fee2e2' : issue.category === 'feature' ? '#dbeafe' : '#f3f4f6'};
                    color: ${issue.category === 'bug' ? '#dc2626' : issue.category === 'feature' ? '#2563eb' : '#6b7280'};
                ">
                    ${categoryEmoji[issue.category] || '📝'} ${issue.category.toUpperCase()}
                </span>
            </td>
            <td style="padding: 12px; vertical-align: top;">
                <a href="mailto:${issue.userEmail}" style="color: #3b82f6;">${issue.userEmail}</a>
            </td>
            <td style="padding: 12px; vertical-align: top; max-width: 400px;">
                <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(issue.description)}</p>
            </td>
            <td style="padding: 12px; vertical-align: top; font-size: 12px; color: #6b7280;">
                ${new Date(issue.reportedAt).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })}
            </td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f9fafb;">
            <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #f59e0b, #ec4899); padding: 24px; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">📋 Notova Issue Report Digest</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">
                        ${issues.length} new issue${issues.length === 1 ? '' : 's'} in the last 24 hours
                    </p>
                </div>
                
                <!-- Summary -->
                <div style="padding: 20px; background: #fef3c7; border-bottom: 1px solid #fcd34d;">
                    <div style="display: flex; gap: 20px;">
                        <div style="text-align: center;">
                            <span style="font-size: 24px; font-weight: bold; color: #dc2626;">
                                ${issues.filter(i => i.category === 'bug').length}
                            </span>
                            <br><span style="font-size: 12px; color: #6b7280;">Bugs</span>
                        </div>
                        <div style="text-align: center;">
                            <span style="font-size: 24px; font-weight: bold; color: #2563eb;">
                                ${issues.filter(i => i.category === 'feature').length}
                            </span>
                            <br><span style="font-size: 12px; color: #6b7280;">Features</span>
                        </div>
                        <div style="text-align: center;">
                            <span style="font-size: 24px; font-weight: bold; color: #6b7280;">
                                ${issues.filter(i => i.category === 'other').length}
                            </span>
                            <br><span style="font-size: 12px; color: #6b7280;">Other</span>
                        </div>
                    </div>
                </div>

                <!-- Issues Table -->
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f3f4f6;">
                            <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">#</th>
                            <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Category</th>
                            <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">User</th>
                            <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Description</th>
                            <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280;">Time (EST)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${issueRows}
                    </tbody>
                </table>

                <!-- Footer -->
                <div style="padding: 16px; background: #f3f4f6; text-align: center; font-size: 12px; color: #6b7280;">
                    This is an automated email from Notova. 
                    <a href="https://notova.app" style="color: #3b82f6;">View Dashboard</a>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
    const htmlEscapes: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, char => htmlEscapes[char] || char);
}
