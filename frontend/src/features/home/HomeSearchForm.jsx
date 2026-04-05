import { MapPin, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDealsSearchParams } from '../deals/deals.filters';

export function HomeSearchForm() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const params = createDealsSearchParams({
      search,
      city,
      page: 1,
    });

    navigate({
      pathname: '/deals',
      search: params.toString() ? `?${params.toString()}` : '',
    });
  };

  return (
    <form className="home-search" onSubmit={handleSubmit}>
      <label className="filter-field">
        <span className="filter-field__label">What do you want to find?</span>
        <div className="filter-field__control">
          <Search size={16} />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            placeholder="Search deals or products"
          />
        </div>
      </label>

      <label className="filter-field">
        <span className="filter-field__label">City</span>
        <div className="filter-field__control">
          <MapPin size={16} />
          <input
            type="text"
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
            }}
            placeholder="Bengaluru"
          />
        </div>
      </label>

      <button type="submit" className="button button--primary home-search__submit">
        Search deals
      </button>
    </form>
  );
}
