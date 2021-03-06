import { GetStaticPaths, GetStaticProps } from 'next';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { api } from '../../services/api';
import { convertDurationToTime } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';
import Head from 'next/head';


type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  description: string;
  durationAsString: string;
  publishedAt: string;
  url: string;
}

type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {

  // const router = useRouter();

  // if (router.isFallback) {
  //   return <p>Carregando</p>
  // }
  const { play } = usePlayer();


  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title}</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>

        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button">
          <img src="/play.svg" alt="Tocar episódio" onClick={() => play(episode)}/>
        </button>
      </div>
      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>
      <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }}></div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {

  const { data } = await api.get('/episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id
      }
    }
  })

  return {
    paths,
     //nos paths eu posso passar paginas para serem geradas na hora do build
    fallback: 'blocking' 
    //true, a pessoa é levada ao link e aí espera carregar (incremental static regeneration)
    //false, aparece erro 404
    //blocking, a pessoa só é levada quando os dados estiverem carregados (incremental static regeneration)
  }
}


export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;
  const { data } = await api.get(`/episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTime(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  }

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24 //24hours
  }
}