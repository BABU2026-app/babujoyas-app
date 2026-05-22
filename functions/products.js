const BASE = 'https://babujoyas.com';

const handler = async function(event) {
  const WS_KEY = 'J1QISR97EIJ3LQRZRB8FP9SDWZN1TIKY';

  const origin = event.headers?.origin || event.headers?.Origin || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const psUrl = `${BASE}/api/products?output_format=JSON&display=full&limit=200&filter[active]=[1]`;
    console.log('Llamando a:', psUrl);

    const psRes = await fetch(psUrl, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(WS_KEY + ':').toString('base64'),
        'Accept': 'application/json',
        'User-Agent': 'BabuJoyas-PWA/1.0',
      }
    });

    if (!psRes.ok) {
      const rawText = await psRes.text();
      console.log('Error PS:', psRes.status, rawText.substring(0, 200));
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: `PrestaShop ${psRes.status}`, products: [], total: 0 })
      };
    }

    const data = await psRes.json();
    const products = (data.products || []).map(mapProduct);
    console.log('Productos obtenidos:', products.length);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ products, total: products.length })
    };

  } catch (err) {
    console.log('Error catch:', err.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message, products: [], total: 0 })
    };
  }
};

function mapProduct(p) {
  const imgId = p.id_default_image;
  let image = null;
  if (imgId) {
    const digits = String(imgId).split('').join('/');
    image = `${BASE}/img/p/${digits}/${imgId}.jpg`;
  }

  const priceVAT = (parseFloat(p.price || 0) * 1.21).toFixed(2).replace('.', ',') + ' €';

  let cats = [];
  if (p.associations?.categories?.length) {
    cats = p.associations.categories.map(c => parseInt(c.id)).filter(id => id > 2);
  }
  if (!cats.length && p.id_category_default && parseInt(p.id_category_default) > 2) {
    cats = [parseInt(p.id_category_default)];
  }
  if (!cats.length) cats = [parseInt(p.id_category_default) || 2];

  const linkRewrite = pickEs(p.link_rewrite);
  const productUrl = (linkRewrite && !linkRewrite.includes('autogeneration-failed'))
    ? `${BASE}/es/${linkRewrite}`
    : `${BASE}/es/index.php?id_product=${p.id}&controller=product`;

  return {
    id: parseInt(p.id),
    name: pickEs(p.name),
    price: priceVAT,
    image,
    reference: p.reference || '',
    description: pickEs(p.description_short).replace(/<[^>]+>/g, '').trim().substring(0, 200),
    categoryId: parseInt(p.id_category_default),
    categories: cats,
    url: productUrl,
  };
}

function pickEs(field) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (Array.isArray(field)) {
    const es = field.find(n => n.iso_code === 'es');
    return (es || field[0] || {}).value || '';
  }
  return String(field);
}

module.exports = { handler };
