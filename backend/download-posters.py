"""Download high-resolution posters, validate dimensions and retain source attribution."""
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image

POSTERS = {
 'dune-part-two': ('693134', '1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'),
 'gladiator-2': ('558449', '2cxhvwyEwRlysAmRH4iodkvo0z5.jpg'),
 'wicked': ('402431', 'xDGbZ0JJ3mYaGKy4Nzd9Kph6M9L.jpg'),
 'interstellar': ('157336', 'gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'),
 'inside-out-2': ('1022789', 'vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg'),
 'inception': ('27205', 'oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg'),
 'the-wild-robot': ('1184918', 'wTnV3PCVW5O92JMrFvvrRcV39RU.jpg'),
}
destination = Path(__file__).resolve().parents[1] / 'frontend/images/posters'
sources = []
for slug, (movie_id, asset) in POSTERS.items():
 url = 'https://image.tmdb.org/t/p/w780/' + asset
 with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=45) as response:
  data = response.read()
 image = Image.open(io.BytesIO(data)).convert('RGB')
 if image.width < 780 or image.height < 1000:
  raise ValueError('Poster too small: ' + slug)
 filename = slug + '-official.jpg'
 image.save(destination / filename, quality=93, optimize=True, progressive=True)
 sources.append({'file': filename, 'source': 'https://www.themoviedb.org/movie/' + movie_id, 'image': url, 'width': image.width, 'height': image.height})
 print(slug, image.size, flush=True)
(destination / 'sources.json').write_text(json.dumps(sources, indent=2) + '\n', encoding='utf-8')
