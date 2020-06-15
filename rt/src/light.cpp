#include <light.hpp>

using namespace rt;

light_t::light_t() {}
light_t::~light_t() {}

/* point light */

point_light_t::point_light_t(const Vector3d &_pos, const Vector3d &_col, const double _ka) : pos(_pos), col(_col), ka(_ka)
{
}

point_light_t::~point_light_t()
{
}

color_t point_light_t::direct(const Vector3d &hitpt, const Vector3d &normal, const object_t *obj, const scene_t *scn, const ray_t &ray) const
{
	// check for shadow ray
	bool is_shadowed = false;
	hit_t hit;

	Vector3d Ldir = this->pos - hitpt;
	Vector3d L = (this->pos - hitpt);
	Ldir.normalize(); // normalized version

	ray_t lit_ray(hitpt, Ldir, 0, sqrt(L.dot(L)));
	std::vector<object_t *>::const_iterator oit;
	for (oit = scn->objs.begin(); oit != scn->objs.end(); oit++)
	{
		if (obj == *oit)
			continue;
		if ((*oit)->intersect(hit, lit_ray))
		{
			is_shadowed = true;
			break;
		}
	}
	//ambient color
	Vector3d amb = ka * col;

	if (is_shadowed)
	{
		return color_t(amb[0], amb[1], amb[2]);
	}

	// proceed if visible to light
	const material_t *mat = obj->get_material();

	// diffuse
	double dot_ln = std::max(0.0, Ldir.dot(normal));

	color_t kd(0.0);
	if (mat->get_is_textured())
	{
		double u, v;
		Vector3d pt = hitpt;
		u = obj->get_tex_u(pt);
		v = obj->get_tex_v(pt);
		kd = mat->get_texture()->get_texmap(u, v);
	}
	else
	{
		kd = mat->get_diffuse();
	}
	Vector3d diff(col[0] * kd.r(), col[1] * kd.g(), col[2] * kd.b());
	diff = dot_ln * diff;

	//specular
	Vector3d spec(0, 0, 0);
	if (dot_ln >= 0)
	{
		Vector3d H = Ldir - ray.direction;
		H.normalize();

		double dot_hn = std::max(0.0, normal.dot(H));
		color_t ks = mat->get_specular();

		spec = Vector3d(col[0] * ks.r(), col[1] * ks.g(), col[2] * ks.b());
		spec = pow(dot_hn, mat->get_shininess()) * spec;
	}

	Vector3d total_illum = amb + (diff + spec);
	return color_t(total_illum[0], total_illum[1], total_illum[2]).clamp();
}

std::vector<std::pair<Vector3d, double>> point_light_t::get_light_samples(const Vector3d &ref) const
{
	return std::vector<std::pair<Vector3d, double>>(1, std::make_pair(pos, 1));
}

void point_light_t::print(std::ostream &stream) const
{
	Eigen::IOFormat CommaInitFmt(Eigen::StreamPrecision, Eigen::DontAlignCols, ", ", ", ", "", "", "[ ", " ]");

	stream << "Light Properties: -------------------------------" << std::endl;
	stream << "Type: Point Light" << std::endl;
	stream << "Position: " << pos.format(CommaInitFmt) << std::endl;
	stream << "Color: " << col.format(CommaInitFmt) << std::endl;
	stream << "Ambient Coefficient: " << ka << std::endl
		   << std::endl;
}

area_light_t::area_light_t(const Vector3d &_pos, double _r, const Vector3d &_col, const double _ka, int _sr) : pos(_pos), radius(_r), col(_col), ka(_ka), sample_rate(_sr)
{
}

area_light_t::~area_light_t()
{
}

std::vector<std::pair<Vector3d, double>> area_light_t::get_light_samples(const Vector3d &ref) const
{
	std::vector<std::pair<Vector3d, double>> samples;
	// double slices = (180 / (double(sample_rate) * 10)) / 2;
	double slices = M_PI / ((double)sample_rate);		   // d(theta)
	double sectors = (2.0 * M_PI) / ((double)sample_rate); // d(phi)

	Vector3d pd = (ref - pos); // refernce point relative to center
	double r2 = radius * radius;
	pd.normalize();
	for (double lats = 0.0; lats <= M_PI; lats += sectors)
	{
		for (double longs = 0.0; longs <= 2.0 * M_PI; longs += slices)
		{
			double x = radius * sin(lats) * cos(longs);
			double y = radius * sin(lats) * sin(longs);
			double z = radius * cos(lats);
			Vector3d pt(x, y, z);
			Vector3d ln = (pt).normalized(); // light normal at that point
			Vector3d sample_point = pt + pos;
			Vector3d rel_vec = ref - sample_point;
			double R2 = rel_vec.dot(rel_vec);
			rel_vec.normalize();
			double cos_alpha = rel_vec.dot(ln);
			if (cos_alpha > 0)
			{
				// include points from facing hemisphere
				// fraction is the solid angle subtended
				double fraction = (cos_alpha * r2 * sin(lats) * sectors * slices) / R2;
				samples.push_back(std::make_pair(sample_point, fraction));
			}
		}
	}
	return samples;
}

color_t area_light_t::direct(const Vector3d &hitpt, const Vector3d &normal, const object_t *obj, const scene_t *scn, const ray_t &ray) const
{
	// get samples of light
	std::vector<std::pair<Vector3d, double>> samples = get_light_samples(hitpt);
	Vector3d total_illum(0, 0, 0);
	/* loop over all the samples
	finally we take the average of all since each sample
	contributes a fraction of total Energy Emitted
	*/
	for (unsigned int i = 0; i < samples.size(); i++)
	{
		Vector3d lpos = samples[i].first;
		double fraction = samples[i].second;
		// check for shadow ray
		bool is_shadowed = false;
		hit_t hit;

		Vector3d Ldir = lpos - hitpt;
		Vector3d L = (lpos - hitpt);
		Ldir.normalize(); // normalized version

		ray_t lit_ray(hitpt, Ldir, 0, sqrt(L.dot(L)));
		std::vector<object_t *>::const_iterator oit;
		for (oit = scn->objs.begin(); oit != scn->objs.end(); oit++)
		{
			if (obj == *oit)
				continue;
			if ((*oit)->intersect(hit, lit_ray))
			{
				is_shadowed = true;
				break;
			}
		}
		//ambient color
		Vector3d amb = ka * col;

		if (is_shadowed)
		{
			continue;
		}

		// proceed if visible to light
		const material_t *mat = obj->get_material();

		// diffuse
		double dot_ln = std::max(0.0, Ldir.dot(normal));

		color_t kd(0.0);
		if (mat->get_is_textured())
		{
			double u, v;
			Vector3d pt = hitpt;
			u = obj->get_tex_u(pt);
			v = obj->get_tex_v(pt);
			kd = mat->get_texture()->get_texmap(u, v);
		}
		else
		{
			kd = mat->get_diffuse();
		}
		Vector3d diff(col[0] * kd.r(), col[1] * kd.g(), col[2] * kd.b());
		diff = dot_ln * diff;

		//specular
		Vector3d spec(0, 0, 0);
		if (dot_ln >= 0)
		{
			Vector3d H = Ldir - ray.direction;
			H.normalize();

			double dot_hn = std::max(0.0, normal.dot(H));
			color_t ks = mat->get_specular();

			spec = Vector3d(col[0] * ks.r(), col[1] * ks.g(), col[2] * ks.b());
			spec = pow(dot_hn, mat->get_shininess()) * spec;
		}

		total_illum += fraction * (amb + (diff + spec));
	}
	return color_t(total_illum[0], total_illum[1], total_illum[2]).clamp();
}

void area_light_t::print(std::ostream &stream) const
{
	Eigen::IOFormat CommaInitFmt(Eigen::StreamPrecision, Eigen::DontAlignCols, ", ", ", ", "", "", "[ ", " ]");

	stream << "Light Properties: -------------------------------" << std::endl;
	stream << "Type: Area Light(spherical)" << std::endl;
	stream << "Position: " << pos.format(CommaInitFmt) << std::endl;
	stream << "Radius: " << radius << std::endl;
	stream << "Color: " << col.format(CommaInitFmt) << std::endl;
	stream << "Ambient Coefficient: " << ka << std::endl
		   << std::endl;
}