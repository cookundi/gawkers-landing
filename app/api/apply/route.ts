import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// POST /api/apply — submit WL application
export async function POST(req: Request) {
    try {
        const { twitter_handle, quote_link, comment_link, wallet_address, reason, referred_by } = await req.json();

        // Validate required fields
        if (!twitter_handle || !quote_link || !comment_link || !wallet_address || !reason) {
            return NextResponse.json({ error: 'All fields required' }, { status: 400 });
        }

        // Sanitize handle
        const handle = twitter_handle.replace('@', '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 15);
        if (handle.length < 1) return NextResponse.json({ error: 'Invalid X handle' }, { status: 400 });

        // Validate EVM address
        if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
            return NextResponse.json({ error: 'Invalid EVM wallet address' }, { status: 400 });
        }

        // Check duplicate
        const existing = await sql`SELECT id FROM wl_applications WHERE twitter_handle = ${handle}`;
        if (existing.length > 0) {
            return NextResponse.json({ error: 'This X handle has already applied' }, { status: 409 });
        }

        // Check referrer exists and is not self
        let cleanReferrer = null;
        if (referred_by) {
            const ref = referred_by.replace('@', '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 15);
            if (ref !== handle) cleanReferrer = ref;
        }

        // Insert application
        await sql`
            INSERT INTO wl_applications (twitter_handle, quote_link, comment_link, wallet_address, reason, referred_by)
            VALUES (${handle}, ${quote_link}, ${comment_link}, ${wallet_address}, ${reason}, ${cleanReferrer})
        `;

        // Record referral + increment referrer count
        if (cleanReferrer) {
            await sql`
                INSERT INTO wl_referrals (referrer_handle, referred_handle)
                VALUES (${cleanReferrer}, ${handle})
                ON CONFLICT (referred_handle) DO NOTHING
            `;
            await sql`
                UPDATE wl_applications SET referral_count = referral_count + 1
                WHERE twitter_handle = ${cleanReferrer}
            `;
        }

        return NextResponse.json({ success: true, handle });
    } catch (e: any) {
        if (e.message?.includes('unique')) {
            return NextResponse.json({ error: 'This X handle has already applied' }, { status: 409 });
        }
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// GET /api/apply?handle=xxx — check application status + referral count
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const handle = searchParams.get('handle')?.replace('@', '').toLowerCase();

        if (!handle) return NextResponse.json({ error: 'Missing handle' }, { status: 400 });

        const result = await sql`
            SELECT twitter_handle, referral_count, status, created_at
            FROM wl_applications WHERE twitter_handle = ${handle}
        `;

        if (result.length === 0) return NextResponse.json({ exists: false });

        return NextResponse.json({ exists: true, ...result[0] });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}