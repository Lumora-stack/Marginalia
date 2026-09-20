import { useParams } from 'react-router-dom';
import Gallery from '../components/Gallery';

export default function Section() {
  const { id } = useParams();

  if (!id) return null;

  return (
    <div>
      <h1 className="text-4xl md:text-5xl mb-12 capitalize font-serif tracking-tight">
        {id.replace('-', ' ')}
      </h1>
      
      <Gallery sectionId={id} />
    </div>
  );
}
