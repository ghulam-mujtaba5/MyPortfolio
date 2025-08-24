import axios from 'axios';

export default async function handler(req, res) {
  const { filename, url } = req.query;

  if (!url) {
    return res.status(400).send('Missing URL parameter');
  }

  try {
    const response = await axios.get(url, {
      responseType: 'stream',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename || 'resume.pdf'}`);
    response.data.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Error downloading file');
  }
}
