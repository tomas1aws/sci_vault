import rss from '@astrojs/rss';
import { getPublishedNodes } from '../lib/content';
export async function GET(context){const nodes=await getPublishedNodes();return rss({title:'SciFi Vault',description:'Nodos publicados del archivo SciFi Vault.',site:context.site,items:nodes.map(n=>({title:n.data.title,description:n.data.description,pubDate:n.data.updatedAt,link:`/archivo/${n.data.slug}/`}))});}
