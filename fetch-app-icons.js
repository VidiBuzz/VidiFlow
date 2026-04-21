/**
 * Script to check Google Favicon availability for Cloudron apps
 */
const https = require('https');

const APPS = [
  {id:'ai.librechat.cloudronapp', name:'LibreChat', site:'librechat.ai'},
  {id:'com.ollama.cloudronapp', name:'Ollama', site:'ollama.com'},
  {id:'com.openwebui.cloudronapp', name:'Open WebUI', site:'openwebui.com'},
  {id:'io.directus9.cloudronapp', name:'Directus', site:'directus.io'},
  {id:'org.wordpress.cloudronapp', name:'WordPress', site:'wordpress.org'},
  {id:'org.ghost.cloudronapp2', name:'Ghost', site:'ghost.org'},
  {id:'org.getgrav.cloudronapp', name:'Grav', site:'getgrav.org'},
  {id:'org.mediawiki.cloudronapp', name:'MediaWiki', site:'mediawiki.org'},
  {id:'org.omekas.cloudronapp', name:'Omeka S', site:'omeka.org'},
  {id:'com.bookstackapp.cloudronapp', name:'BookStack', site:'bookstackapp.com'},
  {id:'org.wikijs.cloudronapp', name:'Wiki.js', site:'js.wiki'},
  {id:'org.dokuwiki.cloudronapp', name:'DokuWiki', site:'dokuwiki.org'},
  {id:'io.hackmd.cloudronapp', name:'HedgeDoc', site:'hedgedoc.org'},
  {id:'org.etherpad.cloudronapp', name:'Etherpad', site:'etherpad.org'},
  {id:'fr.cryptpad.cloudronapp', name:'CryptPad', site:'cryptpad.fr'},
  {id:'com.getoutline.cloudronapp', name:'Outline', site:'getoutline.com'},
  {id:'com.github.trilium.cloudronapp', name:'TriliumNext', site:'github.com/TriliumNext'},
  {id:'com.usememos.cloudronapp', name:'Memos', site:'usememos.com'},
  {id:'org.joplinapp.cloudron', name:'Joplin Server', site:'joplinapp.org'},
  {id:'com.collaboraoffice.coudronapp', name:'Collabora Online', site:'collaboraoffice.com'},
  {id:'com.onlyoffice.coudronapp', name:'ONLYOFFICE Docs', site:'onlyoffice.com'},
  {id:'com.documenso.cloudronapp', name:'Documenso', site:'documenso.com'},
  {id:'co.docuseal.cloudronapp', name:'DocuSeal', site:'docuseal.co'},
  {id:'com.documize.cloudronapp', name:'Documize', site:'documize.com'},
  {id:'chat.rocket.cloudronapp', name:'Rocket.Chat', site:'rocket.chat'},
  {id:'org.mattermost.cloudronapp2', name:'Mattermost', site:'mattermost.com'},
  {id:'im.riot.cloudronapp', name:'Element', site:'element.io'},
  {id:'org.matrix.synapse', name:'Matrix Synapse', site:'matrix.org'},
  {id:'org.nodebb.cloudronapp', name:'NodeBB', site:'nodebb.com'},
  {id:'org.discourse.cloudronapp', name:'Discourse', site:'discourse.org'},
  {id:'com.humhub.cloudronapp', name:'HumHub', site:'humhub.com'},
  {id:'io.github.thelounge', name:'The Lounge', site:'thelounge.chat'},
  {id:'org.loomio.cloudronapp', name:'Loomio', site:'loomio.com'},
  {id:'com.mirotalkbro.cloudronapp', name:'MiroTalk Bro', site:'mirotalk.com'},
  {id:'com.mirotalkp2p.cloudronapp', name:'MiroTalk P2P', site:'mirotalk.com'},
  {id:'com.mirotalksfu.cloudronapp', name:'MiroTalk SFU', site:'mirotalk.com'},
  {id:'org.apache.answer.cloudronapp', name:'Apache Answer', site:'answer.apache.org'},
  {id:'org.bigbluebutton.greenlight3.cloudronapp', name:'Greenlight', site:'bigbluebutton.org'},
  {id:'com.teamspeak.cloudronapp', name:'TeamSpeak', site:'teamspeak.com'},
  {id:'com.gitlab.cloudronapp', name:'GitLab', site:'gitlab.com'},
  {id:'io.gitea.cloudronapp', name:'Gitea', site:'gitea.io'},
  {id:'org.forgejo.cloudron', name:'Forgejo', site:'forgejo.org'},
  {id:'io.gogs.cloudronapp', name:'Gogs', site:'gogs.io'},
  {id:'org.woodpecker_ci.cloudronapp', name:'Woodpecker CI', site:'woodpecker-ci.org'},
  {id:'org.eggertsson.verdaccio', name:'Verdaccio', site:'verdaccio.org'},
  {id:'app.penpot.cloudronapp', name:'Penpot', site:'penpot.app'},
  {id:'org.weblate.cloudronapp', name:'Weblate', site:'weblate.org'},
  {id:'com.docker.registry', name:'Container Registry', site:'docker.com'},
  {id:'org.jupyter.cloudronapp', name:'JupyterHub', site:'jupyter.org'},
  {id:'github.pages.cloudronapp', name:'GitHub Pages', site:'pages.github.com'},
  {id:'lamp.cloudronapp.php74', name:'LAMP', site:'php.net'},
  {id:'com.grafana.cloudronapp', name:'Grafana', site:'grafana.com'},
  {id:'io.prometheus.cloudronapp', name:'Prometheus', site:'prometheus.io'},
  {id:'io.prometheus.alertmanager.cloudronapp', name:'Alertmanager', site:'prometheus.io'},
  {id:'louislam.uptimekuma.app', name:'Uptime Kuma', site:'uptime.kuma.pet'},
  {id:'dev.beszel.cloudronapp', name:'Beszel', site:'beszel.dev'},
  {id:'com.metabase.cloudronapp', name:'Metabase', site:'metabase.com'},
  {id:'io.redash.cloudronapp', name:'Redash', site:'redash.io'},
  {id:'org.apache.superset.cloudronapp', name:'Apache Superset', site:'superset.apache.org'},
  {id:'is.umami.cloudronapp', name:'Umami', site:'umami.is'},
  {id:'com.electerious.ackee', name:'Ackee', site:'ackee.electerious.com'},
  {id:'org.piwik.cloudronapp', name:'Matomo', site:'matomo.org'},
  {id:'com.serpbear.cloudronapp', name:'SerpBear', site:'serpbear.com'},
  {id:'io.changedetection.cloudronapp', name:'changedetection.io', site:'changedetection.io'},
  {id:'net.roundcube.cloudronapp', name:'Roundcube', site:'roundcube.net'},
  {id:'nu.sogo.cloudronapp2', name:'SOGo', site:'sogo.nu'},
  {id:'eu.snappymail.cloudronapp', name:'SnappyMail', site:'snappymail.eu'},
  {id:'app.listmonk.cloudronapp', name:'Listmonk', site:'listmonk.app'},
  {id:'io.keila.cloudronapp', name:'Keila', site:'keila.io'},
  {id:'org.mautic.cloudronapp', name:'Mautic', site:'mautic.org'},
  {id:'net.freescout.cloudronapp', name:'FreeScout', site:'freescout.net'},
  {id:'com.osticket.cloudronapp', name:'osTicket', site:'osticket.com'},
  {id:'com.chatwoot.cloudronapp', name:'Chatwoot', site:'chatwoot.com'},
  {id:'com.nextcloud.cloudronapp', name:'Nextcloud', site:'nextcloud.com'},
  {id:'net.syncthing.cloudronapp2', name:'Syncthing', site:'syncthing.net'},
  {id:'io.minio.cloudronapp', name:'MinIO', site:'min.io'},
  {id:'io.cloudron.cubby', name:'Cubby', site:'cloudron.io'},
  {id:'com.sftpgo.cloudronapp', name:'SFTPGo', site:'sftpgo.com'},
  {id:'io.cloudron.surfer', name:'Surfer', site:'cloudron.io'},
  {id:'net.jirafeau.cloudronapp', name:'Jirafeau', site:'jirafeau.net'},
  {id:'app.xbackbone.cloudronapp', name:'XBackBone', site:'xbackbone.app'},
  {id:'net.pairdrop.cloudronapp', name:'Pairdrop', site:'pairdrop.net'},
  {id:'pizza.file.cloudronapp', name:'File Pizza', site:'file.pizza'},
  {id:'app.immich.cloudronapp', name:'Immich', site:'immich.app'},
  {id:'org.jellyfin.cloudronapp', name:'Jellyfin', site:'jellyfin.org'},
  {id:'media.emby.cloudronapp', name:'Emby', site:'emby.media'},
  {id:'org.navidrome.cloudronapp', name:'Navidrome', site:'navidrome.org'},
  {id:'org.audiobookshelf.cloudronapp', name:'Audiobookshelf', site:'audiobookshelf.org'},
  {id:'calibreweb.janeczku.github', name:'Calibre-Web', site:'calibre-ebook.com'},
  {id:'com.kavitareader.cloudronapp', name:'Kavita', site:'kavitareader.com'},
  {id:'org.komga.cloudronapp', name:'Komga', site:'komga.org'},
  {id:'dev.koel.cloudronapp', name:'Koel', site:'koel.dev'},
  {id:'org.ampache.cloudronapp', name:'Ampache', site:'ampache.org'},
  {id:'org.piwigo.cloudronapp', name:'Piwigo', site:'piwigo.org'},
  {id:'com.electerious.lychee.cloudronapp', name:'Lychee', site:'lycheeorg.github.io'},
  {id:'online.owncast.cloudronapp', name:'Owncast', site:'owncast.online'},
  {id:'org.joinpeertube.cloudronapp', name:'PeerTube', site:'joinpeertube.org'},
  {id:'org.joinmastodon.cloudronapp', name:'Mastodon', site:'joinmastodon.org'},
  {id:'org.pixelfed.cloudronapp', name:'Pixelfed', site:'pixelfed.org'},
  {id:'org.castopod.cloudronapp', name:'Castopod', site:'castopod.org'},
  {id:'io.taiga.cloudronapp', name:'Taiga', site:'taiga.io'},
  {id:'org.openproject.cloudronapp', name:'OpenProject', site:'openproject.org'},
  {id:'io.vikunja.cloudronapp', name:'Vikunja', site:'vikunja.io'},
  {id:'io.wekan.cloudronapp', name:'Wekan', site:'wekan.team'},
  {id:'net.kanboard.cloudronapp', name:'Kanboard', site:'kanboard.org'},
  {id:'io.leantime.cloudronapp', name:'Leantime', site:'leantime.io'},
  {id:'org.redmine.coudronapp', name:'Redmine', site:'redmine.org'},
  {id:'com.github.bitwardenrs', name:'Vaultwarden', site:'bitwarden.com'},
  {id:'app.twofauth.cloudronapp', name:'2FAuth', site:'2fauth.app'},
  {id:'org.keycloak.cloudronapp', name:'Keycloak', site:'keycloak.org'},
  {id:'io.cloudron.openvpn', name:'VPN', site:'openvpn.net'},
  {id:'com.adguard.home.cloudronapp', name:'AdGuard Home', site:'adguard.com'},
  {id:'info.privatebin.cloudronapp', name:'PrivateBin', site:'privatebin.info'},
  {id:'io.vaultproject.cloudronapp2', name:'Vault', site:'vaultproject.io'},
  {id:'io.n8n.cloudronapp', name:'n8n', site:'n8n.io'},
  {id:'com.nocodb.cloudronapp', name:'NocoDB', site:'nocodb.com'},
  {id:'io.baserow.cloudronapp', name:'Baserow', site:'baserow.io'},
  {id:'com.getgrist.cloudronapp', name:'Grist', site:'getgrist.com'},
  {id:'io.pocketbase.cloudronapp', name:'PocketBase', site:'pocketbase.io'},
  {id:'io.typebot.cloudronapp', name:'Typebot', site:'typebot.io'},
  {id:'com.formbricks.cloudronapp', name:'Formbricks', site:'formbricks.com'},
  {id:'com.cal.cloudronapp', name:'Cal.com', site:'cal.com'},
  {id:'co.rallly.cloudronapp', name:'Rallly', site:'rallly.co'},
  {id:'org.kimai.cloudronapp', name:'Kimai', site:'kimai.org'},
  {id:'io.homeassistant.cloudronapp', name:'Home Assistant', site:'home-assistant.io'},
  {id:'org.traccar.cloudronapp', name:'Traccar', site:'traccar.org'},
  {id:'app.dawarich.cloudronapp', name:'Dawarich', site:'dawarich.app'},
  {id:'org.apache.guacamole.cloudronapp', name:'Guacamole', site:'guacamole.apache.org'},
  {id:'io.github.ascimoo.searx', name:'SearXNG', site:'searxng.org'},
  {id:'com.hastebin.cloudronapp', name:'Hastebin', site:'hastebin.com'},
  {id:'dev.ophir.wbo.cloudronapp', name:'WBO', site:'wbo.ophir.dev'},
  {id:'stirlingpdf.frooodle.cloudronapp1', name:'Stirling PDF', site:'stirlingtools.com'},
  {id:'tech.ittools.cloudron', name:'IT Tools', site:'it-tools.tech'},
  {id:'com.rssbridgeapp.cloudronapp', name:'RSS-Bridge', site:'rss-bridge.org'},
  {id:'org.freshrss.cloudronapp', name:'FreshRSS', site:'freshrss.org'},
  {id:'app.miniflux.cloudronapp', name:'Miniflux', site:'miniflux.app'},
  {id:'com.github.shaarli', name:'Shaarli', site:'shaarli.io'},
  {id:'link.linkding.cloudronapp', name:'Linkding', site:'linkding.app'},
  {id:'app.linkwarden.cloudronapp', name:'Linkwarden', site:'linkwarden.app'},
  {id:'com.github.go_shiori', name:'Shiori', site:'github.com/go-shiori/shiori'},
  {id:'io.invidious.cloudronapp', name:'Invidious', site:'invidious.io'},
  {id:'org.wallabag.cloudronapp2', name:'Wallabag', site:'wallabag.it'},
  {id:'dev.tandoor.cloudronapp', name:'Tandoor', site:'tandoor.dev'},
  {id:'io.mealie.cloudronapp', name:'Mealie', site:'mealie.io'},
  {id:'com.snipeitapp.cloudronapp', name:'Snipe-IT', site:'snipeitapp.com'},
  {id:'org.glpi.cloudronapp', name:'GLPI', site:'glpi-project.org'},
  {id:'org.openwebcalendar.cloudronapp', name:'Open Web Calendar', site:'openwebcalendar.net'},
  {id:'org.radicale.cloudronapp2', name:'Radicale', site:'radicale.org'},
  {id:'com.ctfreak.cloudronapp', name:'Ctfreak', site:'ctfreak.com'},
  {id:'io.cloudron.releasebell', name:'ReleaseBell', site:'cloudron.io'},
  {id:'com.postiz.cloudronapp', name:'Postiz', site:'postiz.app'},
  {id:'it.kutt.cloudronapp', name:'Kutt', site:'kutt.it'},
  {id:'org.yourls.cloudronapp', name:'YOURLS', site:'yourls.org'},
  {id:'io.cloudron.builtin.appproxy', name:'App Proxy', site:'cloudron.io'},
  {id:'sh.ntfy.cloudronapp', name:'ntfy', site:'ntfy.sh'},
  {id:'org.languagetool.cloudronapp', name:'LanguageTool', site:'languagetool.org'},
  {id:'io.cloudron.geoip', name:'IP2Location', site:'ip2location.com'},
  {id:'io.evcc.cloudronapp', name:'evcc', site:'evcc.io'},
  {id:'io.fider.cloudronapp', name:'Fider', site:'fider.io'},
  {id:'app.comentario.cloudronapp', name:'Comentario', site:'comentario.app'},
  {id:'com.monicahq.cloudronapp', name:'MonicaHQ', site:'monicahq.com'},
  {id:'org.moodle.cloudronapp', name:'Moodle', site:'moodle.org'},
  {id:'org.easyappointments.cloudronapp', name:'Easy!Appointments', site:'easyappointments.org'},
  {id:'eu.pretix.cloudronapp', name:'Pretix', site:'pretix.eu'},
  {id:'org.fireflyiii.cloudronapp', name:'Firefly III', site:'firefly-iii.org'},
  {id:'org.actualbudget.cloudronapp', name:'Actual Budget', site:'actualbudget.org'},
  {id:'com.invoiceninja.cloudronapp2', name:'Invoice Ninja', site:'invoiceninja.com'},
  {id:'com.wallosapp.cloudronapp', name:'Wallos', site:'wallosapp.com'},
  {id:'org.dolibarr.cloudronapp', name:'Dolibarr', site:'dolibarr.org'},
  {id:'com.espocrm.cloudronapp', name:'Espo CRM', site:'espocrm.com'},
  {id:'net.minecraft.cloudronapp', name:'Minecraft', site:'minecraft.net'},
  {id:'net.minecraft.bedrock.cloudronapp', name:'Minecraft Bedrock', site:'minecraft.net'},
  {id:'com.valheim.cloudronapp', name:'Valheim Server', site:'valheimgame.com'},
];

function checkGoogleFavicon(site) {
  return new Promise((resolve) => {
    const url = `https://www.google.com/s2/favicons?domain=${site}&sz=64`;
    https.get(url, (res) => {
      resolve({ site, url, status: res.statusCode, hasFavicon: res.statusCode === 200 });
    }).on('error', (e) => {
      resolve({ site, url, status: 'error', hasFavicon: false, error: e.message });
    });
  });
}

async function main() {
  console.log('Checking Google Favicon availability for all apps...\n');
  
  const results = [];
  
  for (const app of APPS) {
    if (app.site) {
      const result = await checkGoogleFavicon(app.site);
      results.push({ ...app, ...result });
    } else {
      results.push({ ...app, hasFavicon: false, reason: 'No site' });
    }
  }
  
  const withFavicons = results.filter(r => r.hasFavicon);
  const withoutFavicons = results.filter(r => !r.hasFavicon);
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Total apps: ${results.length}`);
  console.log(`With Google Favicons: ${withFavicons.length}`);
  console.log(`Without favicons: ${withoutFavicons.length}\n`);
  
  console.log('=== APPS WITH FAVICONS (will show icons in browser) ===\n');
  withFavicons.slice(0, 30).forEach(app => {
    console.log(`${app.name}: ${app.url}`);
  });
  if (withFavicons.length > 30) {
    console.log(`... and ${withFavicons.length - 30} more`);
  }
  
  console.log('\n=== APPS WITHOUT FAVICONS ===\n');
  withoutFavicons.forEach(app => {
    console.log(`${app.name}: ${app.site || 'no site'}`);
  });
}

main().catch(console.error);
