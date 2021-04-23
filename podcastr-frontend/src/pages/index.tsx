import { GetStaticProps } from 'next';
import { api } from '../services/api';

// 1 - SPA
// 2 - SSR
// 3 - SSG

//1 - import { useEffect } from "react"

type Episode = {
  id: string;
  title: string;
  members: string;

}

type HomeProps = {
  episodes: Episode[]
}

export default function Home(props: HomeProps) {

  // 1 - SPA
  // useEffect(() => {
  //   fetch('http://localhost:3333/apisodes')
  //   .then(response => response.json())
  //   .then(data => console.log(data))
  // }, [])


  return (
    <>
      <h1>Index</h1>
      <p>{JSON.stringify(props.episodes)}</p>
    </>
  )
}

// 2 - SSR - executa toda vez que alguem acessa a home da aplicacao
// export async function getServerSideProps() {
//   const response = await fetch('http://localhost:3333/episodes')
//   const data = await response.json()
//   return { 
//     props: { // sempre props
//       episodes: data, //qualquer nome
//     }
//   }
// }


// 3 - SSG - executa toda vez que alguem acessa a home da aplicacao - só funciona em produção
export const getStaticProps : GetStaticProps = async () => {
  const { data } = await api.get('/apisodes', { 
    params: { 
      _limit: 12,
      _sort:'published_at',
      _order: 'desc'
    }
  })

  return { 
    props: { // sempre props
      episodes: data, //qualquer nome
    },
    revalidate: 60*60*8 // tempo em segundos para que uma nova versão da pagina seja gerada
  }
}