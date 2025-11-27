import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import Select, { components } from 'react-select';
import type { GroupBase, MultiValue, GroupHeadingProps } from "react-select";
import citiesData from './data/cities.json';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import logoLight from './assets/worldclockr.png';
import logoDark from './assets/worldclockr-white.png';


// TYPES

  // Typage JSON
  type RawCity  = {
    citie: string;
    timezone: string;
  };

  type RawRegion  = {
    region: string;
    options: RawCity[];
  };


  // Typage react-select
  type CityOption = {
    label: string;
    value: string;
    timezone: string;
  };

  type GroupedOptions = {
    label: string;
    options: CityOption[];
  };




export default function App() {


  // CONSTANTES

    const [params] = useSearchParams();
    const navigate = useNavigate();
    const url = window.location.href;

    // States
    const [selectedCities, setSelectedCities] = useState<CityOption[]>([]);
    const [groupedCities, setGroupedCities] = useState<GroupedOptions[]>([]);
    const [copied, setCopied] = useState(false);
    const [isLight, setIsLight] = useState(() => {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      const savedTheme = localStorage.getItem('theme');
      const useLight = savedTheme === 'light' || (!savedTheme && prefersLight);
      if (useLight) {
        return true;
      } else {
        return false;
      }
    });




  // FONCTIONS

    // Copier l'url
    const handleCopy = () => {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    // Style des groupes du react-select
    const CustomGroupHeading = <
      Option extends CityOption,
      IsMulti extends boolean = true
    >(props: GroupHeadingProps<Option, IsMulti, GroupBase<Option>>) => (
      <components.GroupHeading {...props}>
        <div className="pt-2 pb-2 border-t border-b border-gray-200">
          <span className="text-blue-600 text-sm uppercase">{props.children}</span>
        </div>
      </components.GroupHeading>
    );

    // Changer le thème
    const toggleLightMode = () => {
      if (isLight) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
      setIsLight(!isLight);
    };



  
  // USE EFFECTS

    // Charger les villes depuis le JSON
    useEffect(() => {
      const formatted: GroupedOptions[] = (citiesData as RawRegion[]).map((region) => ({
        label: region.region,
        options: region.options.map((opt, index) => ({
          label: opt.citie,
          value: `${opt.citie}-${index}`,
          timezone: opt.timezone,
        })),
      }));
      setGroupedCities(formatted);
    }, []);


    // Récupérer les valeurs de l'URL au chargement
    useEffect(() => {
      const citiesParam = params.get("timezone");
      if (citiesParam && groupedCities.length) {
        const selected = citiesParam
          .split(",")
          .map((val) => groupedCities.flatMap((g) => g.options).find((c) => c.label === decodeURIComponent(val)))
          .filter(Boolean) as CityOption[];
        setSelectedCities(selected);
      }
    }, [params, groupedCities]);

    // Mettre à jour l'URL
    useEffect(() => {
      if (selectedCities.length > 0) {
        const values = selectedCities.map((c) => encodeURIComponent(c.label)).join(",");
        navigate(`/?timezone=${values}`, { replace: true });
      } else {
        navigate(`/`, { replace: true });
      }
    }, [selectedCities, navigate, url]);




  return (
    <AnimatePresence>
      <div className={`min-h-screen bg-gradient-to-r flex flex-col items-center justify-center p-8 pt-12 transition-colors duration-500 ${isLight ? 'from-blue-100 to-purple-200 text-gray-900' : 'from-gray-900 to-gray-800 text-gray-100'}`}>


        {/* TITRE */}
        <h1 className="text-4xl font-bold mb-2 transition-colors duration-500 flex items-center">
          <div className="relative h-12 w-12 mr-2">
            {/* Logo light */}
            <img
              src={logoLight}
              className={`absolute inset-0 h-12 w-12 transition-opacity duration-500 ${
                isLight ? "opacity-100" : "opacity-0"
              }`}
              alt="Logo noir"
            />
            {/* Logo dark */}
            <img
              src={logoDark}
              className={`absolute inset-0 h-12 w-12 transition-opacity duration-500 ${
                isLight ? "opacity-0" : "opacity-100"
              }`}
              alt="Logo blanc"
            />
          </div>
          WorldClockr
        </h1>
        <p className={`text-lg mb-6 transition-colors duration-500 text-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Comparez facilement les heures à travers le monde</p>



        {/* BOUTON DU THEME */}
        <div className="right-3 top-5 fixed z-100">
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" checked={!isLight} onChange={toggleLightMode} className="sr-only peer" />
            <div className={`${isLight ? 'bg-white border-black after:bg-black after:border-black' : 'bg-dark border-white after:bg-white after:border-white'} relative w-11 h-6 peer-focus:outline-none ring-2 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black`}></div>
            <span className="ms-2 text-sm font-medium">{isLight ? <Moon /> : <Sun />}</span>
          </label>
        </div>



        {/* SELECT */}
        <div className="w-full max-w-md mb-6">
          <Select<CityOption, true, GroupBase<CityOption>>
            options={groupedCities}
            value={selectedCities}
            onChange={(newValue: MultiValue<CityOption>) =>
              setSelectedCities([...newValue])
            }
            placeholder="Choisissez une ou plusieurs villes..."
            isMulti
            closeMenuOnSelect={false}
            components={{ GroupHeading: CustomGroupHeading }}
            styles={{
              control: (base) => ({ ...base, backgroundColor: "#f3f4f6", color: "#111827", cursor: "pointer" }),
              multiValue: (base) => ({ ...base, backgroundColor: "#ddd", color: "#111827" }),
              multiValueLabel: (base) => ({ ...base, backgroundColor: "#ddd", color: "#111827" }),
              menu: (base) => ({ ...base, backgroundColor: "#fff", color: "#111827" }),
              dropdownIndicator: (base) => ({ ...base, ":hover": { color: "#111827" } }),
              clearIndicator: (base) => ({ ...base, ":hover": { color: "#b91c1c" } }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#e5e7eb" : "#fff",
                color: "#111827",
              }),
            }}
          />
        </div>



        {/* HEURES DES VILLES SELECTIONNEES */}
        <div className="flex flex-col w-full max-w-md items-center">
          <AnimatePresence>
            {selectedCities.map((city) => {
              const now = DateTime.now().setZone(city.timezone);
              return (
                  <motion.p
                    className="text-lg font-semibold m-0"
                    key={city.value}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {city.label} - {now.toFormat("HH:mm")}
                  </motion.p>
              );
            })}
          </AnimatePresence>
        </div>



        {/* LIEN DE PARTAGE */}
        <AnimatePresence>
          {selectedCities.length > 0 && (
            <motion.div
              className="flex items-center justify-center gap-2 mt-6 flex-wrap sm:flex-nowrap"
              key="share-section"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
                >
                  {copied ? "Copié !" : "Partager"}
                </button>
                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'} break-all text-center`}>{decodeURIComponent(url)}</p>
            </motion.div>
          )}
        </AnimatePresence>


      </div>
    </AnimatePresence>
  );
}
