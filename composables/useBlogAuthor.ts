/* eslint-disable @stylistic/indent */
// Preload blog config data for the current locale
import authorList from "~/data/author.json";

export interface AuthorRaw {
  id: string;
  name: string;
  bio: Record<string, string>;
  avatar: string;
  socialMedia: {
    github?: string;
    twitter?: string;
  };
}

interface AuthorSocial {
  text: string;
  url: string;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  socialMedia: {
    github?: AuthorSocial;
    twitter?: AuthorSocial;
  };
}

function makeSocialAt(social: string, type: "twitter" | "github") {
  switch (type) {
    case "github": {
      // https://github.com/username
      const username = social.replace(/https?:\/\/github.com\//, "");

      // strip last slash if any
      return `@${username.replace(/\/$/, "")}`;
    }
    case "twitter": {
      // https://twitter.com/username
      const username = social.replace(/https?:\/\/twitter.com\//, "");

      // strip last slash if any
      return `@${username.replace(/\/$/, "")}`;
    }
  }
}

function formatAuthor(author: AuthorRaw, lang: string, defaultLang: string): Author {
  const firstRecord = author.bio[Object.keys(author.bio)[0]];

  return {
    id: author.id,
    name: author.name,
    bio: author.bio[lang] ?? author.bio[defaultLang] ?? firstRecord,
    avatar: author.avatar,
    socialMedia: {
      github: author.socialMedia.github
        ? {
            text: makeSocialAt(author.socialMedia.github, "github"),
            url: author.socialMedia.github,
          }
        : undefined,
      twitter: author.socialMedia.twitter
        ? {
            text: makeSocialAt(author.socialMedia.twitter, "twitter"),
            url: author.socialMedia.twitter,
          }
        : undefined,
    },
  };
}

export default function () {
  const { locale, defaultLocale } = useI18n();

  const formattedAuthors = computed(() => {
    return authorList.map((author) => formatAuthor(author, locale.value, defaultLocale));
  });

  const getAuthor = (id: string) => {
    return formattedAuthors.value.find((author) => author.id === id);
  };

  return {
    authors: formattedAuthors,
    getAuthor,
  };
}
