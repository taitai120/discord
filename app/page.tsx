"use client";

import Head from "next/head";
import { motion } from "framer-motion";
import Link from "next/link";

const Page = () => {
  return (
    <>
      <Head>
        <title>Shadow Discord - Your Place to Talk</title>
        <meta
          name="description"
          content="Chat, hang out, and stay close with your friends and communities."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="bg-gray-900 text-white min-h-screen">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-10 py-6 bg-gray-800 shadow-md">
          <h1 className="text-2xl font-bold">Shadow Discord</h1>
          <ul className="flex gap-6">
            <li className="hover:text-indigo-400 cursor-pointer">Download</li>
            <li className="hover:text-indigo-400 cursor-pointer">Why Us?</li>
            <li className="hover:text-indigo-400 cursor-pointer">Support</li>
            <li className="hover:text-indigo-400 cursor-pointer">
              <Link href="/sign-in">Login</Link>
            </li>
          </ul>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-6 py-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold max-w-3xl"
          >
            Imagine a Place...
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 max-w-xl text-lg md:text-xl text-gray-300"
          >
            ...where you can belong to a school club, a gaming group, or a
            worldwide art community. Where just you and a few friends can spend
            time together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-10 flex gap-4"
          >
            <button className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full font-semibold">
              <Link href="/web">Open Shadow Discord in Browser</Link>
            </button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16 bg-gray-800">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-2">Voice Channels</h3>
              <p className="text-gray-400">
                Hop in and out of voice channels with ease.
              </p>
            </motion.div>
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-2">Custom Servers</h3>
              <p className="text-gray-400">
                Build your own space with roles and moderation.
              </p>
            </motion.div>
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-2">Text Channels</h3>
              <p className="text-gray-400">
                Stay in touch with communities or small friend groups.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-10 text-center border-t border-gray-700">
          <p>
            &copy; {new Date().getFullYear()} Shadow Discord — Unofficial
            Landing Page
          </p>
        </footer>
      </main>
    </>
  );
};

export default Page;
