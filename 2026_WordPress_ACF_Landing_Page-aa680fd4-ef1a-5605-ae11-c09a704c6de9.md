### To set this up right now, you need to follow a **"Template-First"** workflow.
You **must** use a Custom Post Type (CPT). Elementor and ACF do not replace CPTs; they live _inside_ them. Think of the CPT as the "folder" for your 280 pages, ACF as the "form" you fill out for each city, and Elementor as the "glass" that displays that data.
## Slide Deck with full instruction: 
[https://notebooklm.google.com/notebook/cd055581-6124-4999-ae44-af6289aabe99?artifactId=c3cb4633-9036-48ce-a4cf-2c274ea3c310](https://notebooklm.google.com/notebook/cd055581-6124-4999-ae44-af6289aabe99?artifactId=c3cb4633-9036-48ce-a4cf-2c274ea3c310)
![](http://localhost:4000/api/file_storage/d2ba6e62-8ebe-4289-b0dc-07ea5856651a/v1/blob/db3780b5-872d-49a2-afb8-4f1d78adda0c/OBIrpvkuDJEcWNQZx67xB2EmT_uumXEawr8vRiPloUc=.png)

### The 4-Step Technical Workflow
|**Step**|**Tool**|**Action**|
|---|---|---|
|**1. Register**|**ACF > Post Types**|Create a CPT called "City Pages" (Slug: `city_page`).|
|**2. Define**|**ACF > Field Groups**|Create the "input fields" (Hero Image, City Name, Local Landmark Copy).|
|**3. Design**|**Elementor > Theme Builder**|Create 1 single template. Map widgets to the ACF fields.|
|**4. Ingest**|**WP All Import**|Upload your CSV. Map columns to your ACF fields.|
---
### 1. The Input: What the WordPress Admin looks like
When you go to **City Pages > Add New**, you will see a structured form. You are not "building" the page here; you are just providing the data.
Admin Interface
Jan 29, 3:58 PM
---
### 2. The Bridge: Mapping Elementor to ACF
Inside the **Elementor Single Post Template**, you don't type "Chicago." You tell Elementor to "go look at the ACF field."
1.  **Select a Heading Widget.**
1.  In the Content settings, click the **Dynamic Tags icon** (the stack of discs).
1.  Choose **ACF Field**.
1.  Click the wrench icon and select your key: `hero_headline`.
---

### 3. The Output: What the live site looks like
Because you mapped the fields, the single Elementor design creates unique pages for all 280 cities instantly.

![](http://localhost:4000/api/file_storage/d2ba6e62-8ebe-4289-b0dc-07ea5856651a/v1/blob/db3780b5-872d-49a2-afb8-4f1d78adda0c/OGxJJzyzEwepM8JfrdmpRlgxhoZw27T-OUazhnzc7K4=.png)
## ALREADY COMPLETED:
### 4. The Bulk Import (Final Step)
In **WP All Import**, you map your CSV columns to these specific ACF field names.
*   `{city_name\[1\]}` goes to `acf\_city\_name`
*   `{hero_headline\[1\]}` goes to `acf\_hero\_headline`
**Why this works:** You have **one** Elementor template to maintain. If you want to change the font for all 280 cities, you edit the template once. If you want to change the content for Austin, you just edit the Austin "City Page" post fields.
I have updated your architecture document with these specific UI mapping steps.
This is the exact sequence. You create the **CPT first** to give the data a home, the **ACF fields second** to define the data, and **Elementor third** to display it.
Do you want me to provide the specific CSV header structure you'll need for WP All Import to handle the images correctly?

You only need **ONE** Custom Post Type and **ONE** Elementor Template. You do not create a different CPT for each city. You create one CPT called "City Pages," and inside that "folder," you will have 280 individual posts (one for Chicago, one for Austin, etc.).
The reason your page is blank is that you likely haven't linked the **Elementor Dynamic Tags** to the **ACF Fields**.
Here is the exact technical setup and the visual code for the page you are building.
### 1. The Structure (Mental Model)
* **CPT (The Folder):** `city_pages`
* **ACF (The Form):** One field group assigned to the `city_pages` post type.
* **Elementor (The Design):** One "Single Post Template" that acts as a mask. When you visit `/chicago`, the mask pulls Chicago data. When you visit `/austin`, the same mask pulls Austin data.
### 2. The Step-by-Step Setup
1. **ACF:** Create a field group with the IDs: `city_name`, `hero_headline`, `hero_image`, `main_content`.
1. **Elementor:** Go to **Templates > Theme Builder > Single Post**.
1. **The Fix:** You must click the **Dynamic Tags** icon on every widget. If you just type "Chicago" in Elementor, every page will say Chicago. You must select **ACF Field > City Name**.
I have generated a fully functional HTML/CSS version of what your Elementor output _should_ look like once mapped correctly. Use this as your design blueprint.

# Eliminate "WP Import" - Hard Code Data Source
PostgreSQL paired with Vespa is the optimal database source for your new AI-powered web app, aligning with your self-hosted stacks like Directus, RAG systems, and multimodal search needs.[dogtownmedia+1](https://www.dogtownmedia.com/how-to-choose-the-right-database-for-your-mobile-app-backend/)
## Core Recommendation
Start with **PostgreSQL** as the primary relational database for structured data, user management, and content via Directus—it's your go-to for scalable, geospatial multi-city portals with pgvector extensions for basic AI embeddings. Add **Vespa** as the dedicated vector/ranking engine for hybrid search (BM25, vectors, geospatial, graphs), handling your multimodal AI workloads without Qdrant.[directus+3](https://community.directus.io/t/what-database-backends-are-supported-in-directus/40)
## Key Factors
*   **AI/ML Focus**: Vespa excels in real-time vector search and ML inference at scale, outperforming pgvector alone for production RAG/agent apps.[slashdot+1](https://slashdot.org/software/comparison/EDB-Postgres-AI-vs-Vespa/)
*   **Self-Hosting**: Both are open-source, Docker-friendly (your Railway/Ollama prefs), and cost-effective vs. SaaS at your scale.[[openmetal](https://openmetal.io/resources/blog/when-self-hosting-vector-databases-becomes-cheaper-than-saas/)]​
*   **Directus Integration**: Native support for PostgreSQL; use it for headless CMS, then pipe to Vespa for search.[History+2](https://www.perplexity.ai/search/8b9c4a06-9eff-49ac-8b66-89e923ceff15)
## Comparison Table
|Aspect|PostgreSQL (w/ Directus/pgvector)|Vespa (Primary Vector Engine)|
|---|---|---|
|Strengths|Structured data, geospatial (PostGIS), transactions, scale via Citus sharding for 1M+ users/100 cities [History+2](https://www.perplexity.ai/search/8b9c4a06-9eff-49ac-8b66-89e923ceff15)|Hybrid search (vectors + lexical + geo), ML ranking, multimodal [[slashdot](https://slashdot.org/software/comparison/EDB-Postgres-AI-vs-Vespa/)]​|
|Use in Stack|App state, content, auth|RAG retrieval, agent orchestration [[perplexity](https://www.perplexity.ai/search/22f89eee-73b7-4350-a4da-6a2112f71d50)]​|
|Drawbacks|Vector perf limits at extreme scale [[myscale](https://myscale.com/blog/efficient-data-storage-retrieval-pgvector-vs-vespa-performance/)]​|Steeper setup for non-search data|
|Self-Host Cost|Low (Docker on Railway) [[openmetal](https://openmetal.io/resources/blog/when-self-hosting-vector-databases-becomes-cheaper-than-saas/)]​|Low, RAM-optimized [[openmetal](https://openmetal.io/resources/blog/when-self-hosting-vector-databases-becomes-cheaper-than-saas/)]​|
This combo mirrors your VidiTwin/SmartStack projects—confirm app details (e.g., video Q&A, geo scale) for tweaks.

Yes, the solutions work seamlessly with your ACF custom fields on CPTs—they dynamically populate field values from the external source on page load via WP/ACF filters, skipping any import entirely.[advancedcustomfields+2](https://www.advancedcustomfields.com/resources/acf-load_value/)
Fields map "magically" to your page spots (e.g., template outputs like `get_field('your_acf_field')`), pulling live data every time for dynamic generation.[advancedcustomfields+1](https://support.advancedcustomfields.com/forums/topic/using-acf-load_field-to-populate-values/)
## How It Integrates
The `acf/load_value` filter intercepts ACF's field retrieval, queries your source (MySQL/Supabase/Firebase), and returns mapped data as if it were stored normally—no CPT inserts or plugins needed.[hyperdrivedesigns+2](https://hyperdrivedesigns.com/dynamically-populating-acf-checkbox-field-from-custom-db-query/)
Your CPT pages stay minimal (just IDs/slugs); content/fields render from the query.[[stackoverflow]​](https://stackoverflow.com/questions/34727060/dynamically-populate-a-select-field-in-wordpress-acf-from-a-database-table)
Example tweak for multi-fields (add per field name/key):

_`// For field 'my_acf_field' (use name= or key=)
add_filter('acf/load_value/name=my_acf_field', 'populate_from_external', 10, 3);
function populate_from_external($value, $post_id, $field) {
    if (!$value) { // Skip if already set
        $data = get_external_data($post_id); // Your query func
        $value = $data['mapped_column']; // Direct map
    }
    return $value;
}`_
This runs server-side per field/view, perfect for 280 pages.[advancedcustomfields+1](https://support.advancedcustomfields.com/forums/topic/get-field-values-from-query/)
## ACF Plugins Boost (Optional)
* **ACF Custom Table**: Stores/retrieves ACF in external tables natively (`get_field()` works).[[acf-custom-tables.abhisheksatre]​](https://acf-custom-tables.abhisheksatre.com/)
* Handles repeats/groups out-of-box.[[support.advancedcustomfields]​](https://support.advancedcustomfields.com/forums/topic/acf-to-manage-data-in-custom-database-tables/)
Test by creating a CPT page with ACF spots—data appears on refresh without saving anything to WP DB.[[hyperdrivedesigns]​](https://hyperdrivedesigns.com/dynamically-populating-acf-checkbox-field-from-custom-db-query/)

To connect your WordPress custom post type (CPT) and ACF fields directly to an external data source like Supabase, Firebase, local MySQL table, or Supabase—without WP All Import or any ongoing sync—use a custom plugin or functions.php code to query the source on page load and dynamically map/populate fields/content.[stackoverflow+1](https://stackoverflow.com/questions/15318759/connecting-to-an-external-database-from-within-wordpress)
This "hardwires" the data: pages generate dynamically via shortcodes, ACF filters, or template overrides, pulling fresh data every time for your 280 site swarm pages.[stackoverflow+1](https://stackoverflow.com/questions/34727060/dynamically-populate-a-select-field-in-wordpress-acf-from-a-database-table)
## Quick Setup Steps
1.  **Choose/Pick Source**: Local MySQL table (easiest), Supabase (Postgres API), or Firebase (REST/JS SDK). Create a table matching your CPT/ACF fields (e.g., ID, title, content, custom_field1).[[dev](https://dev.to/dalenguyen/supabase-wordpress-integration-sync-wordpress-posts-and-pages-to-supabase-28f7)]​
1.  **Custom Plugin/Functions**: Add code to query source and hook into ACF/WP_Query for dynamic population.[all4wordpress+1](https://www.all4wordpress.com/save-custom-post-type-to-external-database)
1.  **Map & Display**: Use ACF filters to populate fields from query; output in templates/shortcodes for "magical" mapping.[wordpress+1](https://wordpress.org/plugins/acf-fields-in-custom-table/)
1.  **Generate Pages**: Use WP's page templates + query vars (e.g., /page/{source_id}) for 280 dynamic pages—no static CPTs needed.[[stackoverflow](https://stackoverflow.com/questions/34048943/generating-dynamic-wordpress-web-pages-from-external-db)]​
## Code Examples
Add to a custom plugin (functions.php works too). Replace creds/table with yours.[stackoverflow+1](https://stackoverflow.com/questions/15318759/connecting-to-an-external-database-from-within-wordpress)
## Local MySQL/Supabase (Postgres)
php
// Connect & query external DB (local MySQL or Supabase via wpdb) function  get_external_data($id)  {  $ext_db  =  new  wpdb('user',  'pass',  'your_table',  'localhost');  // Or Supabase: host=aws-0-us-west.supabase.co port=5432 dbname=postgres  $ext_db->show_errors();  return  $ext_db->get_row($ext_db->prepare("SELECT * FROM your_table WHERE id = %d",  $id),  ARRAY_A); }   // Dynamically populate ACF field (hook on load) add_filter('acf/load_value/name=your_acf_field',  'populate_from_external',  10,  3); function  populate_from_external($value,  $post_id,  $field)  {  if  (!$value  &&  $data  =  get\_external\_data($post_id))  {  return  $data
$$
'custom_field'
$$
;  // Maps to ACF spot  }  return  $value; }   // Template/shortcode for full page content function  external\_content\_shortcode($atts)  {  $atts  =  shortcode_atts(
$$
'id'  =>  0
$$
,  $atts);  $data  =  get_external_data($atts
$$
'id'
$$
);  return  $data  ?  esc_html($data
$$
'title'
$$
)  .  '<p>'  .  $data
$$
'content'
$$
.  '</p>'  :  'No data'; } add_shortcode('ext_data',  'external_content_shortcode');
Use
$$
ext_data id="1"
$$
in page/post for auto-mapping.
[[stackoverflow]]
​
## Firebase (JS REST)
Enqueue script; fetch on page load for client-side:
php
`// functions.php wp\_enqueue\_script('firebase-wp', 'https://your-firebase.web.app/script.js'); // Or SDK add\_action('wp\_footer', function() {  ?>  <script>  fetch('https://your-project.firebaseio.com/table.json?orderBy="id"&equalTo=<?php  echo  get\_the\_ID();  ?>')  .then(r  => r.json())  .then(data  =>  {  document.querySelector('.acf-field').innerHTML = data.title;  // Map to page spots  });  </script>  <?php });`
No server query needed.
[[reddit]]
​
## Source Comparison
|Source|Pros|Cons|Best For Your Use|
|---|---|---|---|
|Local MySQL|Fast, no API, wpdb native [[stackoverflow](https://stackoverflow.com/questions/15318759/connecting-to-an-external-database-from-within-wordpress)]​|WP server only|Simplicity|
|Supabase|Postgres API, real-time, scales; plugins like SupaWP for easy query [firebase-wordpress-docs.readthedocs+1](https://firebase-wordpress-docs.readthedocs.io/)|API key secure|280 dynamic pages|
|Firebase|NoSQL flexible, JS client-side [reddit+1](https://www.reddit.com/r/webdev/comments/w9agb1/how_do_i_connect_firebase_with_wordpress_without/)|Paid for heavy use|Quick JS mapping|
For 280 pages: Create a CPT template querying by slug/ID (e.g., single-your_cpt.php with `get\_external\_data(get\_the\_ID())`), then use Site Swarm to generate slugs matching source IDs. Test on staging; secure creds via wp-config.[stackoverflow+1](https://stackoverflow.com/questions/34048943/generating-dynamic-wordpress-web-pages-from-external-db)

