import { ProjectCardsProps } from '@/components/Card'

const localizedProjects1 = {
  id: 'Sebuah Bot Discord untuk melakukan tracking garapan Fansub',
  en: 'A Discord Bot to help manage Anime Fansub projects',
}

const localizedProjects2 = {
  id: 'Sebuah API pribadi dengan fokus tracking live stream VTuber',
  en: 'A personal API proejct with focus of tracking live stream of a VTuber',
}

const projectsData: ProjectCardsProps[] = [
  {
    title: 'naoTimes',
    description: localizedProjects1,
    imgSrc: '/static/images/projects/naotimes.png',
    href: 'https://naoti.me',
  },
  {
    title: 'ihateani.me API',
    description: localizedProjects2,
    imgSrc: '/static/images/projects/ihaapi.png',
    href: 'https://api.ihateani.me',
  },
]

export default projectsData
