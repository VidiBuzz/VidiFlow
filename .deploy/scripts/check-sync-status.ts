import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function checkData() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { count: caseStudyCount } = await supabase.from('case_studies').select('*', { count: 'exact', head: true });
    const { count: companyCount } = await supabase.from('companies').select('*', { count: 'exact', head: true });
    const { count: toolCount } = await supabase.from('tools').select('*', { count: 'exact', head: true });

    console.log(`Summary:`);
    console.log(`- Case Studies: ${caseStudyCount}`);
    console.log(`- Companies: ${companyCount}`);
    console.log(`- Tools: ${toolCount}`);
}

checkData().catch(console.error);
